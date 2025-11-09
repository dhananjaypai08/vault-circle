// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {YieldDonatingTokenizedStrategy} from "@octant-v2-core/strategies/yieldDonating/YieldDonatingTokenizedStrategy.sol";
import {IERC4626} from "@octant-v2-core/core/interfaces/IERC4626Payable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IGroupVaultStrategy} from "../interfaces/IGroupVaultStrategy.sol";
import "../constants/GroupVaultErrors.sol";
import "../constants/GroupVaultEvents.sol";
import "../constants/GroupVaultConstants.sol";
import {ZeroAddress} from "@octant-v2-core/errors.sol";

/**
 * @title GroupVaultStrategy
 * @author Vault Circle Team
 * @custom:security-contact security@vault-circle.io
 * @notice Group vault with automatic yield donation extending Octant's YieldDonatingTokenizedStrategy
 * @dev Implements Yield Donating Strategy (YDS) pattern from Octant-v2-core
 *
 * KEY FEATURES:
 * - Extends Octant's YieldDonatingTokenizedStrategy for battle-tested yield donation
 * - Principal preservation through Octant's proven mechanics
 * - ERC4626 integration with any compatible vault (Katana, Morpho, etc.)
 * - Group pooling with member tracking
 * - Automated yield donation to specified recipient
 *
 * ARCHITECTURE:
 * Users → GroupVaultStrategy (this) → Underlying ERC4626 Vault → Generates Yield
 *                     ↓
 *         YieldDonatingTokenizedStrategy → Mints shares to donation recipient
 *
 * @custom:security Inherits Octant's security model and audit findings
 */
contract GroupVaultStrategy is
    YieldDonatingTokenizedStrategy,
    IGroupVaultStrategy
{
    using SafeERC20 for IERC20;

    // ============================================
    // STORAGE
    // ============================================

    /// @notice Vault configuration
    string private _vaultName;
    address private _underlyingVault; // ERC4626 strategy vault
    address private _vaultAdmin;
    uint256 private _minDeposit;
    uint256 private _depositCap;
    bool private _isPaused;
    uint256 private _createdAt;
    uint256 private _harvestInterval;

    /// @notice Member tracking
    mapping(address => Member) private _members;
    mapping(address => bool) private _isMember;
    address[] private _memberList;

    /// @notice Yield tracking
    uint256 private _lastHarvestTime;
    uint256 private _cumulativeYield;
    uint256 private _cumulativeDonations;
    uint256 private _lastKnownAssets;
    DonationRecord[] private _donationHistory;

    /// @notice Deposit/withdraw tracking
    uint256 private _totalDeposited;
    uint256 private _totalWithdrawn;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initialize Group Vault Strategy
     * @dev Constructor for implementation contract - actual initialization via init()
     * @param tokenizedStrategyImpl Address of Octant's TokenizedStrategy implementation
     */
    constructor(
        address tokenizedStrategyImpl
    ) YieldDonatingTokenizedStrategy() {
        // TokenizedStrategy sets asset to address(1) to prevent direct use
        // Actual initialization happens via initialize()
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * @notice Initialize the vault strategy
     * @dev Called by factory after deployment. Initializes both Octant strategy and vault params
     * @param asset_ Underlying ERC20 asset
     * @param name_ Vault name
     * @param underlyingVault_ ERC4626 vault address
     * @param management_ Management address (admin)
     * @param keeper_ Keeper address for reports
     * @param emergencyAdmin_ Emergency admin
     * @param dragonRouter_ Donation recipient
     * @param minDeposit_ Minimum deposit amount
     * @param depositCap_ Maximum deposits (0 = unlimited)
     * @param harvestInterval_ Minimum time between harvests
     * @custom:throws GroupVault__InvalidStrategy if vault asset != strategy asset
     * @custom:throws ZeroAddress if any address is zero
     */
    function initialize(
        address asset_,
        string calldata name_,
        address underlyingVault_,
        address management_,
        address keeper_,
        address emergencyAdmin_,
        address dragonRouter_,
        uint256 minDeposit_,
        uint256 depositCap_,
        uint256 harvestInterval_
    ) external {
        // Validate inputs
        if (underlyingVault_ == address(0)) revert ZeroAddress();
        if (management_ == address(0)) revert ZeroAddress();
        if (dragonRouter_ == address(0)) revert ZeroAddress();
        if (bytes(name_).length == 0) revert GroupVault__InvalidVaultName();
        if (minDeposit_ == 0) revert GroupVault__InvalidMinDeposit();

        // Validate ERC4626 vault matches asset
        if (IERC4626(underlyingVault_).asset() != asset_) {
            revert GroupVault__InvalidStrategy();
        }

        // Validate harvest interval
        if (
            harvestInterval_ < MIN_HARVEST_INTERVAL ||
            harvestInterval_ > MAX_HARVEST_INTERVAL
        ) {
            revert GroupVault__InvalidHarvestInterval(
                harvestInterval_,
                MIN_HARVEST_INTERVAL,
                MAX_HARVEST_INTERVAL
            );
        }

        // Initialize Octant's TokenizedStrategy
        // This sets up all the core ERC4626 functionality
        super.initialize(
            asset_,
            string(abi.encodePacked("GroupVault-", name_)),
            management_,
            keeper_,
            emergencyAdmin_,
            dragonRouter_,
            true // enableBurning for loss protection
        );

        // Initialize vault-specific storage
        _vaultName = name_;
        _underlyingVault = underlyingVault_;
        _vaultAdmin = management_;
        _minDeposit = minDeposit_;
        _depositCap = depositCap_;
        _isPaused = false;
        _createdAt = block.timestamp;
        _harvestInterval = harvestInterval_;
        _lastHarvestTime = block.timestamp;
        _lastKnownAssets = 0;

        emit GroupVault__VaultCreated(
            address(this),
            management_,
            name_,
            asset_,
            underlyingVault_,
            dragonRouter_
        );
    }

    // ============================================
    // MODIFIERS
    // ============================================

    /// @notice Restricts to vault admin
    modifier onlyVaultAdmin() {
        if (msg.sender != _vaultAdmin) revert GroupVault__NotAdmin();
        _;
    }

    /// @notice Checks vault not paused
    modifier whenNotPaused() {
        if (_isPaused) revert GroupVault__VaultPaused();
        _;
    }

    // ============================================
    // CORE STRATEGY FUNCTIONS (Octant Pattern)
    // ============================================

    /**
     * @notice Deploy funds to underlying ERC4626 vault
     * @dev Called by Octant's TokenizedStrategy on deposits
     * @param amount Amount of assets to deploy
     * @custom:inherit Overrides BaseStrategy._deployFunds
     */
    function _deployFunds(uint256 amount) internal override {
        // Approve underlying vault to spend assets
        IERC20(asset).forceApprove(_underlyingVault, amount);

        // Deposit into ERC4626 vault
        IERC4626(_underlyingVault).deposit(amount, address(this));
    }

    /**
     * @notice Free funds from underlying ERC4626 vault
     * @dev Called by Octant's TokenizedStrategy on withdrawals
     * @param amount Amount of assets to free
     * @custom:inherit Overrides BaseStrategy._freeFunds
     */
    function _freeFunds(uint256 amount) internal override {
        // Calculate shares needed from underlying vault
        uint256 shares = IERC4626(_underlyingVault).convertToShares(amount);

        // Redeem from ERC4626 vault
        IERC4626(_underlyingVault).redeem(shares, address(this), address(this));
    }

    /**
     * @notice Harvest and report yields
     * @dev Called by Octant's report() function. Calculates yields from underlying vault
     * @return profit Amount of profit generated
     * @return loss Amount of loss incurred
     * @custom:inherit Overrides BaseStrategy._harvestAndReport
     */
    function _harvestAndReport()
        internal
        override
        returns (uint256 profit, uint256 loss)
    {
        // Get current value in underlying vault
        uint256 vaultShares = IERC4626(_underlyingVault).balanceOf(
            address(this)
        );
        uint256 currentAssets = IERC4626(_underlyingVault).convertToAssets(
            vaultShares
        );
        uint256 expectedAssets = _lastKnownAssets;

        // Calculate profit or loss
        if (currentAssets > expectedAssets) {
            profit = currentAssets - expectedAssets;
            _cumulativeYield += profit;

            // Record donation (shares will be minted by YieldDonatingTokenizedStrategy)
            _recordDonation(profit);
        } else if (currentAssets < expectedAssets) {
            loss = expectedAssets - currentAssets;
        }

        _lastKnownAssets = currentAssets;
        _lastHarvestTime = block.timestamp;

        return (profit, loss);
    }

    // ============================================
    // DEPOSIT/WITHDRAW OVERRIDES
    // ============================================

    /**
     * @notice Deposit assets with vault-specific validation
     * @dev Extends Octant's deposit with member tracking and vault limits
     * @param assets Amount to deposit
     * @param receiver Address receiving shares
     * @return shares Amount of shares minted
     * @custom:throws GroupVault__InsufficientDeposit if below minimum
     * @custom:throws GroupVault__DepositCapReached if exceeds cap
     * @custom:throws GroupVault__VaultPaused if vault paused
     */
    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused returns (uint256 shares) {
        // Validate deposit amount
        if (assets < _minDeposit) {
            revert GroupVault__InsufficientDeposit(_minDeposit, assets);
        }

        // Check deposit cap
        if (_depositCap > 0) {
            uint256 newTotal = _totalDeposited + assets;
            if (newTotal > _depositCap) {
                revert GroupVault__DepositCapReached(_depositCap, newTotal);
            }
        }

        // Add member if new
        if (!_isMember[receiver]) {
            _addMember(receiver);
        }

        // Call Octant's deposit (handles all ERC4626 logic)
        shares = super.deposit(assets, receiver);

        // Update tracking
        _members[receiver].totalDeposited += assets;
        _members[receiver].shares += shares;
        _totalDeposited += assets;

        emit GroupVault__Deposit(msg.sender, receiver, assets, shares);

        return shares;
    }

    /**
     * @notice Withdraw assets with member validation
     * @dev Extends Octant's withdraw with member tracking
     * @param assets Amount to withdraw
     * @param receiver Address receiving assets
     * @param owner Address whose shares are burned
     * @return shares Amount of shares burned
     * @custom:throws GroupVault__MemberNotFound if owner not a member
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override returns (uint256 shares) {
        if (!_isMember[owner]) revert GroupVault__MemberNotFound(owner);

        // Call Octant's withdraw (handles all ERC4626 logic + authorization)
        shares = super.withdraw(assets, receiver, owner);

        // Update tracking
        _members[owner].shares -= shares;
        _totalWithdrawn += assets;

        emit GroupVault__Withdraw(msg.sender, receiver, owner, assets, shares);

        return shares;
    }

    // ============================================
    // HARVEST FUNCTION
    // ============================================

    /**
     * @notice Manually trigger harvest
     * @dev Calls Octant's report() which triggers _harvestAndReport()
     * @return profit Amount of profit
     * @return loss Amount of loss
     * @custom:throws GroupVault__HarvestTooSoon if called before interval elapsed
     */
    function harvest() external returns (uint256 profit, uint256 loss) {
        uint256 timeSinceLastHarvest = block.timestamp - _lastHarvestTime;

        if (timeSinceLastHarvest < _harvestInterval) {
            revert GroupVault__HarvestTooSoon(
                timeSinceLastHarvest,
                _harvestInterval
            );
        }

        // Call Octant's report function
        return this.report();
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /// @inheritdoc IGroupVaultStrategy
    function getVaultInfo() external view returns (VaultConfig memory) {
        return
            VaultConfig({
                name: _vaultName,
                asset: asset,
                strategy: _underlyingVault,
                donationRecipient: dragonRouter,
                admin: _vaultAdmin,
                minDeposit: _minDeposit,
                depositCap: _depositCap,
                isPaused: _isPaused,
                createdAt: _createdAt,
                harvestInterval: _harvestInterval
            });
    }

    /// @inheritdoc IGroupVaultStrategy
    function getMemberInfo(
        address member
    ) external view returns (Member memory) {
        return _members[member];
    }

    /// @inheritdoc IGroupVaultStrategy
    function getPerformance() external view returns (PerformanceReport memory) {
        uint256 total = this.totalAssets();
        uint256 supply = this.totalSupply();
        uint256 pricePerShare = supply > 0 ? (total * 1e18) / supply : 1e18;

        return
            PerformanceReport({
                totalAssets: total,
                totalShares: supply,
                yieldGenerated: _cumulativeYield,
                yieldDonated: _cumulativeDonations,
                pricePerShare: pricePerShare,
                memberCount: _memberList.length
            });
    }

    /// @inheritdoc IGroupVaultStrategy
    function getMembers() external view returns (address[] memory) {
        return _memberList;
    }

    /// @inheritdoc IGroupVaultStrategy
    function getDonationHistory()
        external
        view
        returns (DonationRecord[] memory)
    {
        return _donationHistory;
    }

    /// @inheritdoc IGroupVaultStrategy
    function isMember(address account) external view returns (bool) {
        return _isMember[account];
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// @inheritdoc IGroupVaultStrategy
    function updateStrategy(address newStrategy) external onlyVaultAdmin {
        if (newStrategy == address(0)) revert ZeroAddress();
        if (IERC4626(newStrategy).asset() != asset) {
            revert GroupVault__InvalidStrategy();
        }

        address oldStrategy = _underlyingVault;
        _underlyingVault = newStrategy;

        emit GroupVault__StrategyUpdated(oldStrategy, newStrategy);
    }

    /// @inheritdoc IGroupVaultStrategy
    function updateDonationRecipient(
        address newRecipient
    ) external onlyVaultAdmin {
        if (newRecipient == address(0)) revert ZeroAddress();

        // Use Octant's setDragonRouter (has cooldown period)
        this.setDragonRouter(newRecipient);

        emit GroupVault__DonationRecipientUpdated(dragonRouter, newRecipient);
    }

    /// @inheritdoc IGroupVaultStrategy
    function updateMinDeposit(uint256 newMinDeposit) external onlyVaultAdmin {
        if (newMinDeposit == 0) revert GroupVault__InvalidMinDeposit();

        uint256 oldMinDeposit = _minDeposit;
        _minDeposit = newMinDeposit;

        emit GroupVault__MinDepositUpdated(oldMinDeposit, newMinDeposit);
    }

    /// @inheritdoc IGroupVaultStrategy
    function updateDepositCap(uint256 newDepositCap) external onlyVaultAdmin {
        uint256 oldDepositCap = _depositCap;
        _depositCap = newDepositCap;

        emit GroupVault__DepositCapUpdated(oldDepositCap, newDepositCap);
    }

    /// @inheritdoc IGroupVaultStrategy
    function updateHarvestInterval(
        uint256 newInterval
    ) external onlyVaultAdmin {
        if (
            newInterval < MIN_HARVEST_INTERVAL ||
            newInterval > MAX_HARVEST_INTERVAL
        ) {
            revert GroupVault__InvalidHarvestInterval(
                newInterval,
                MIN_HARVEST_INTERVAL,
                MAX_HARVEST_INTERVAL
            );
        }

        uint256 oldInterval = _harvestInterval;
        _harvestInterval = newInterval;

        emit GroupVault__HarvestIntervalUpdated(oldInterval, newInterval);
    }

    /// @inheritdoc IGroupVaultStrategy
    function pause() external onlyVaultAdmin {
        if (_isPaused) revert GroupVault__VaultNotPaused();

        _isPaused = true;
        emit GroupVault__VaultPaused(msg.sender, block.timestamp);
    }

    /// @inheritdoc IGroupVaultStrategy
    function unpause() external onlyVaultAdmin {
        if (!_isPaused) revert GroupVault__VaultNotPaused();

        _isPaused = false;
        emit GroupVault__VaultUnpaused(msg.sender, block.timestamp);
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    /**
     * @notice Add new member to vault
     * @param member Address to add
     */
    function _addMember(address member) internal {
        _members[member] = Member({
            isActive: true,
            joinedAt: block.timestamp,
            shares: 0,
            totalDeposited: 0
        });
        _isMember[member] = true;
        _memberList.push(member);

        emit GroupVault__MemberAdded(member, block.timestamp);
    }

    /**
     * @notice Record donation event
     * @param amount Amount donated
     */
    function _recordDonation(uint256 amount) internal {
        _donationHistory.push(
            DonationRecord({
                id: _donationHistory.length,
                amount: amount,
                recipient: dragonRouter,
                timestamp: block.timestamp,
                yieldSourced: amount
            })
        );

        _cumulativeDonations += amount;

        emit GroupVault__YieldHarvested(
            _donationHistory.length - 1,
            amount,
            block.timestamp
        );
        emit GroupVault__YieldDonated(
            _donationHistory.length - 1,
            dragonRouter,
            amount,
            block.timestamp
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {IGroupVault} from "../../interfaces/IGroupVault.sol";
import {GroupVaultTypes} from "../../types/GroupVaultTypes.sol";

/**
 * @title GroupVault
 * @notice Group vault with automatic yield donation to specified recipient
 * @dev Implements Yield Donating Strategy (YDS) pattern similar to Octant
 *
 * KEY FEATURES:
 * - Principal preservation: Depositors' principal always protected
 * - Yield donation: All yields automatically donated to recipient
 * - ERC4626 integration: Works with any ERC4626 vault (Katana vaults)
 * - Group pooling: Multiple users can pool funds together
 *
 * ARCHITECTURE:
 * Users deposit → GroupVault → Katana ERC4626 Vault → Generates Yield
 * Yields harvested → Minted as shares to donation recipient
 */
contract GroupVault is IGroupVault {
    // Vault Configuration
    string public name;
    address public asset; // Underlying ERC20 token
    address public underlyingVault; // ERC4626 strategy (Katana vault)
    address public donationRecipient; // Receives donated yields
    address public admin; // Vault administrator
    uint256 public minDeposit; // Minimum deposit amount
    uint256 public depositCap; // Maximum total deposits (0 = unlimited)
    bool public isPaused; // Pause state
    uint256 public createdAt; // Creation timestamp

    // ERC20-like State
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 private _totalShares;
    mapping(address => uint256) private _balances;

    // Member Tracking
    mapping(address => GroupVaultTypes.Member) private _members;
    mapping(address => bool) private _isMember;
    address[] private _memberList;

    // Yield Tracking
    uint256 public lastHarvestTime;
    uint256 public cumulativeYield;
    uint256 public cumulativeDonations;
    uint256 private _lastKnownAssets;
    GroupVaultTypes.DonationRecord[] private _donationHistory;

    // Deposit/Withdraw Tracking
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    /**
     * @notice Initialize a new Group Vault
     * @param name_ Vault name
     * @param asset_ Underlying asset (ERC20)
     * @param strategy_ ERC4626 strategy vault
     * @param donationRecipient_ Yield recipient
     * @param admin_ Vault administrator
     * @param minDeposit_ Minimum deposit amount
     * @param depositCap_ Deposit cap (0 = unlimited)
     */
    constructor(
        string memory name_,
        address asset_,
        address strategy_,
        address donationRecipient_,
        address admin_,
        uint256 minDeposit_,
        uint256 depositCap_
    ) {
        if (asset_ == address(0)) revert ZeroAddress();
        if (strategy_ == address(0)) revert ZeroAddress();
        if (donationRecipient_ == address(0)) revert ZeroAddress();
        if (admin_ == address(0)) revert ZeroAddress();
        if (bytes(name_).length == 0) revert InvalidVaultName();
        if (minDeposit_ == 0) revert InvalidMinDeposit();

        if (IERC4626(strategy_).asset() != asset_) revert InvalidStrategy();

        name = name_;
        symbol = string(abi.encodePacked("gv", name_));
        asset = asset_;
        underlyingVault = strategy_;
        donationRecipient = donationRecipient_;
        admin = admin_;
        minDeposit = minDeposit_;
        depositCap = depositCap_;
        createdAt = block.timestamp;
        lastHarvestTime = block.timestamp;
        _lastKnownAssets = 0;

        emit VaultCreated(address(this), name_, admin_, asset_);
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (isPaused) revert VaultPaused();
        _;
    }

    modifier whenPaused() {
        if (!isPaused) revert VaultNotPaused();
        _;
    }

    /**
     * @notice Deposit assets into the vault
     * @dev Assets are deposited into underlying ERC4626 strategy
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive vault shares
     * @return shares Amount of shares minted
     */
    function deposit(
        uint256 assets,
        address receiver
    ) external whenNotPaused returns (uint256 shares) {
        if (assets == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();
        if (assets < minDeposit) revert InsufficientDeposit(minDeposit, assets);

        if (depositCap > 0) {
            uint256 newTotal = totalDeposited + assets;
            if (newTotal > depositCap) {
                revert DepositCapReached(depositCap, newTotal);
            }
        }

        // Calculate shares (1:1 ratio for principal preservation)
        shares = assets;

        _safeTransferFrom(asset, msg.sender, address(this), assets);

        _safeApprove(asset, underlyingVault, assets);
        uint256 vaultShares = IERC4626(underlyingVault).deposit(
            assets,
            address(this)
        );
        require(vaultShares > 0, "No vault shares received");

        if (!_isMember[receiver]) {
            _addMember(receiver);
        }

        GroupVaultTypes.Member storage member = _members[receiver];
        member.totalDeposited += assets;
        member.shares += shares;

        _mint(receiver, shares);

        totalDeposited += assets;
        _lastKnownAssets = totalAssets();

        emit Deposit(msg.sender, receiver, assets, shares);

        return shares;
    }

    /**
     * @notice Withdraw assets from the vault
     * @dev Burns shares and withdraws from underlying strategy
     * @param shares Amount of shares to burn
     * @param receiver Address to receive assets
     * @param owner Address of share owner
     * @return assets Amount of assets withdrawn
     */
    function withdraw(
        uint256 shares,
        address receiver,
        address owner
    ) external returns (uint256 assets) {
        if (shares == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();
        if (msg.sender != owner && msg.sender != admin) revert Unauthorized();
        if (!_isMember[owner]) revert MemberNotFound(owner);

        GroupVaultTypes.Member storage member = _members[owner];
        if (member.shares < shares)
            revert InsufficientShares(shares, member.shares);

        // Calculate assets to return (1:1 ratio for principal)
        assets = shares; // Principal preservation

        _burn(owner, shares);

        member.shares -= shares;

        // Withdraw from underlying vault
        // We need to convert our assets to vault shares to redeem
        uint256 vaultSharesNeeded = IERC4626(underlyingVault).convertToShares(
            assets
        );
        uint256 assetsReceived = IERC4626(underlyingVault).redeem(
            vaultSharesNeeded,
            receiver,
            address(this)
        );

        // Update tracking
        totalWithdrawn += assetsReceived;
        _lastKnownAssets = totalAssets();

        emit Withdraw(msg.sender, receiver, owner, assetsReceived, shares);

        return assetsReceived;
    }

    /**
     * @notice Harvest yield and donate to recipient
     * @dev Implements YDS pattern - profits minted as shares to donation recipient
     * @return yieldGenerated Amount of yield harvested
     */
    function harvest() external returns (uint256 yieldGenerated) {
        uint256 currentAssets = totalAssets();
        uint256 expectedAssets = _lastKnownAssets;

        // Calculate yield (profit over expected principal)
        if (currentAssets > expectedAssets) {
            yieldGenerated = currentAssets - expectedAssets;

            if (yieldGenerated > 0) {
                // Mint shares to donation recipient equivalent to yield value
                // This preserves the 1:1 asset:share ratio for original depositors
                uint256 donationShares = yieldGenerated;

                if (!_isMember[donationRecipient]) {
                    _addMember(donationRecipient);
                }

                _mint(donationRecipient, donationShares);
                _members[donationRecipient].shares += donationShares;

                // Record donation
                _donationHistory.push(
                    GroupVaultTypes.DonationRecord({
                        id: _donationHistory.length,
                        amount: yieldGenerated,
                        recipient: donationRecipient,
                        timestamp: block.timestamp,
                        yieldSourced: yieldGenerated
                    })
                );

                cumulativeYield += yieldGenerated;
                cumulativeDonations += yieldGenerated;

                emit YieldHarvested(
                    _donationHistory.length - 1,
                    yieldGenerated,
                    block.timestamp
                );
                emit YieldDonated(
                    _donationHistory.length - 1,
                    donationRecipient,
                    yieldGenerated,
                    block.timestamp
                );
            }
        }

        _lastKnownAssets = totalAssets();
        lastHarvestTime = block.timestamp;

        return yieldGenerated;
    }

    // ============ View Functions ============

    /**
     * @notice Get total assets in vault (including strategy)
     * @return Total assets
     */
    function totalAssets() public view returns (uint256) {
        uint256 vaultShares = IERC4626(underlyingVault).balanceOf(
            address(this)
        );
        return IERC4626(underlyingVault).convertToAssets(vaultShares);
    }

    /**
     * @notice Get total shares issued
     * @return Total shares
     */
    function totalShares() external view returns (uint256) {
        return _totalShares;
    }

    /**
     * @notice Convert assets to shares (1:1 for principal)
     * @param assets Amount of assets
     * @return shares Equivalent shares
     */
    function convertToShares(
        uint256 assets
    ) public pure returns (uint256 shares) {
        return assets; // 1:1 ratio for principal preservation
    }

    /**
     * @notice Convert shares to assets (1:1 for principal)
     * @param shares Amount of shares
     * @return assets Equivalent assets
     */
    function convertToAssets(
        uint256 shares
    ) public pure returns (uint256 assets) {
        return shares; // 1:1 ratio for principal preservation
    }

    /**
     * @notice Get vault configuration
     * @return Vault config struct
     */
    function getVaultInfo()
        external
        view
        returns (GroupVaultTypes.VaultConfig memory)
    {
        return
            GroupVaultTypes.VaultConfig({
                name: name,
                asset: asset,
                strategy: underlyingVault,
                donationRecipient: donationRecipient,
                admin: admin,
                minDeposit: minDeposit,
                depositCap: depositCap,
                isPaused: isPaused,
                createdAt: createdAt
            });
    }

    /**
     * @notice Get member information
     * @param member Address of member
     * @return Member info struct
     */
    function getMemberInfo(
        address member
    ) external view returns (GroupVaultTypes.Member memory) {
        return _members[member];
    }

    /**
     * @notice Get vault performance metrics
     * @return Performance report struct
     */
    function getPerformance()
        external
        view
        returns (GroupVaultTypes.PerformanceReport memory)
    {
        uint256 total = totalAssets();
        uint256 pricePerShare = _totalShares > 0
            ? (total * 1e18) / _totalShares
            : 1e18;

        return
            GroupVaultTypes.PerformanceReport({
                totalAssets: total,
                totalShares: _totalShares,
                yieldGenerated: cumulativeYield,
                yieldDonated: cumulativeDonations,
                pricePerShare: pricePerShare,
                memberCount: _memberList.length
            });
    }

    /**
     * @notice Get all members
     * @return Array of member addresses
     */
    function getMembers() external view returns (address[] memory) {
        return _memberList;
    }

    /**
     * @notice Get donation history
     * @return Array of donation records
     */
    function getDonationHistory()
        external
        view
        returns (GroupVaultTypes.DonationRecord[] memory)
    {
        return _donationHistory;
    }

    /**
     * @notice Get user's balance
     * @param account Address to query
     * @return Balance of shares
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Update strategy vault
     * @param newStrategy New strategy address
     */
    function updateStrategy(address newStrategy) external onlyAdmin {
        if (newStrategy == address(0)) revert ZeroAddress();
        if (IERC4626(newStrategy).asset() != asset) revert InvalidStrategy();

        address oldStrategy = underlyingVault;
        underlyingVault = newStrategy;

        emit StrategyUpdated(oldStrategy, newStrategy);
    }

    /**
     * @notice Update donation recipient
     * @param newRecipient New recipient address
     */
    function updateDonationRecipient(address newRecipient) external onlyAdmin {
        if (newRecipient == address(0)) revert ZeroAddress();

        address oldRecipient = donationRecipient;
        donationRecipient = newRecipient;

        emit DonationRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Update minimum deposit
     * @param newMinDeposit New minimum deposit
     */
    function updateMinDeposit(uint256 newMinDeposit) external onlyAdmin {
        if (newMinDeposit == 0) revert InvalidMinDeposit();

        uint256 oldMinDeposit = minDeposit;
        minDeposit = newMinDeposit;

        emit MinDepositUpdated(oldMinDeposit, newMinDeposit);
    }

    /**
     * @notice Update deposit cap
     * @param newDepositCap New deposit cap
     */
    function updateDepositCap(uint256 newDepositCap) external onlyAdmin {
        uint256 oldDepositCap = depositCap;
        depositCap = newDepositCap;

        emit DepositCapUpdated(oldDepositCap, newDepositCap);
    }

    /**
     * @notice Pause vault
     */
    function pause() external onlyAdmin whenNotPaused {
        isPaused = true;
        emit VaultPause(admin, block.timestamp);
    }

    /**
     * @notice Unpause vault
     */
    function unpause() external onlyAdmin whenPaused {
        isPaused = false;
        emit VaultUnpaused(admin, block.timestamp);
    }

    /**
     * @notice Add new member
     */
    function _addMember(address member) internal {
        _members[member] = GroupVaultTypes.Member({
            isActive: true,
            joinedAt: block.timestamp,
            shares: 0,
            totalDeposited: 0
        });
        _isMember[member] = true;
        _memberList.push(member);

        emit MemberAdded(member, block.timestamp);
    }

    /**
     * @notice Mint shares
     */
    function _mint(address to, uint256 amount) internal {
        _totalShares += amount;
        _balances[to] += amount;
    }

    /**
     * @notice Burn shares
     */
    function _burn(address from, uint256 amount) internal {
        _balances[from] -= amount;
        _totalShares -= amount;
    }

    /**
     * @notice Safe transfer from
     */
    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal {
        (bool success, bytes memory _data) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from,
                to,
                amount
            )
        );
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Safe approve
     */
    function _safeApprove(
        address token,
        address spender,
        uint256 amount
    ) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Approve failed"
        );
    }
}

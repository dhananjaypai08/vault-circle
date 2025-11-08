// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../../interfaces/IERC20.sol";
import {IERC4626} from "../../interfaces/IERC4626.sol";
import {IGroupVault} from "../../interfaces/IGroupVault.sol";
import {GroupVaultTypes} from "../../types/GroupVaultTypes.sol";

/**
 * @title GroupVault
 * @notice A vault where groups can pool funds and donate yields to chosen recipients
 * @dev Implements Yield Donating Strategy (YDS) pattern - yields go to donation recipient
 * @author Dhananjay - Smart Contract Engineer
 */
contract GroupVault is IGroupVault {
    // ============ Constants ============
    
    uint256 private constant PRECISION = 1e18;
    uint256 private constant MAX_BPS = 10000;

    // ============ Storage ============
    
    string public name;
    address public immutable asset;
    address public immutable underlyingVault; // Katana ERC4626 vault (e.g., IbvbUSDC)
    address public donationRecipient;
    address public admin;
    
    uint256 public minDeposit;
    uint256 public depositCap;
    uint256 public createdAt;
    bool public isPaused;

    // Share accounting
    mapping(address => uint256) private _shares;
    uint256 private _totalShares;

    // Member tracking
    mapping(address => GroupVaultTypes.Member) private _members;
    address[] private _memberList;
    mapping(address => bool) private _isMember;

    // Performance tracking
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public cumulativeYield;
    uint256 public cumulativeDonations;
    uint256 public lastHarvestTime;
    uint256 private _lastKnownAssets;

    GroupVaultTypes.DonationRecord[] private _donationHistory;

    // ============ Modifiers ============
    
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

    // ============ Constructor ============
    
    constructor(
        string memory _name,
        address _asset,
        address _underlyingVault,
        address _donationRecipient,
        address _admin,
        uint256 _minDeposit,
        uint256 _depositCap
    ) {
        if (_asset == address(0)) revert ZeroAddress();
        if (_underlyingVault == address(0)) revert ZeroAddress();
        if (_donationRecipient == address(0)) revert ZeroAddress();
        if (_admin == address(0)) revert ZeroAddress();

        // Verify vault asset matches
        if (IERC4626(_underlyingVault).asset() != _asset) revert InvalidStrategy();

        name = _name;
        asset = _asset;
        underlyingVault = _underlyingVault;
        donationRecipient = _donationRecipient;
        admin = _admin;
        minDeposit = _minDeposit;
        depositCap = _depositCap;
        createdAt = block.timestamp;
        lastHarvestTime = block.timestamp;

        // Approve underlying vault to spend assets
        IERC20(_asset).approve(_underlyingVault, type(uint256).max);

        emit VaultCreated(address(this), _name, _admin, _asset);
    }

    // ============ External Functions ============
    
    /**
     * @notice Deposit assets into the vault
     * @param assets Amount of assets to deposit
     * @param receiver Address to receive shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver) 
        external 
        whenNotPaused 
        returns (uint256 shares) 
    {
        if (assets == 0) revert ZeroAmount();
        if (assets < minDeposit) revert InsufficientDeposit(minDeposit, assets);
        if (receiver == address(0)) revert ZeroAddress();

        // Check deposit cap
        if (depositCap > 0) {
            uint256 newTotal = totalAssets() + assets;
            if (newTotal > depositCap) revert DepositCapReached(depositCap, newTotal);
        }

        // Calculate shares to mint
        shares = convertToShares(assets);
        if (shares == 0) revert ZeroAmount();

        // Transfer assets from sender
        bool success = IERC20(asset).transferFrom(msg.sender, address(this), assets);
        if (!success) revert TransferFailed();

        // Deposit into underlying vault
        uint256 vaultShares = IERC4626(underlyingVault).deposit(assets, address(this));
        require(vaultShares > 0, "No vault shares received");

        // Update member info
        if (!_isMember[receiver]) {
            _addMember(receiver);
        }

        GroupVaultTypes.Member storage member = _members[receiver];
        member.totalDeposited += assets;
        member.shares += shares;

        // Mint shares
        _mint(receiver, shares);

        // Update tracking
        totalDeposited += assets;

        emit Deposit(msg.sender, receiver, assets, shares);

        return shares;
    }

    /**
     * @notice Withdraw assets from the vault
     * @param shares Amount of shares to burn
     * @param receiver Address to receive assets
     * @param owner Address of share owner
     * @return assets Amount of assets withdrawn
     */
    function withdraw(uint256 shares, address receiver, address owner) 
        external 
        returns (uint256 assets) 
    {
        if (shares == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();
        if (msg.sender != owner && msg.sender != admin) revert Unauthorized();
        if (!_isMember[owner]) revert MemberNotFound(owner);

        GroupVaultTypes.Member storage member = _members[owner];
        if (member.shares < shares) revert InsufficientShares(shares, member.shares);

        // Calculate assets to return
        assets = convertToAssets(shares);
        if (assets == 0) revert ZeroAmount();

        // Burn shares
        _burn(owner, shares);

        // Update member info
        member.shares -= shares;

        // Withdraw from underlying vault
        uint256 vaultSharesNeeded = IERC4626(underlyingVault).convertToShares(assets);
        uint256 assetsReceived = IERC4626(underlyingVault).redeem(
            vaultSharesNeeded,
            receiver,
            address(this)
        );

        // Update tracking
        totalWithdrawn += assetsReceived;

        emit Withdraw(msg.sender, receiver, assetsReceived, shares);

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
                uint256 donationShares = (yieldGenerated * _totalShares) / expectedAssets;
                
                if (!_isMember[donationRecipient]) {
                    _addMember(donationRecipient);
                }

                _mint(donationRecipient, donationShares);
                _members[donationRecipient].shares += donationShares;

                // Record donation
                _donationHistory.push(GroupVaultTypes.DonationRecord({
                    id: _donationHistory.length,
                    amount: yieldGenerated,
                    recipient: donationRecipient,
                    timestamp: block.timestamp,
                    yieldSourced: yieldGenerated
                }));

                cumulativeYield += yieldGenerated;
                cumulativeDonations += yieldGenerated;

                emit YieldHarvested(_donationHistory.length - 1, yieldGenerated, block.timestamp);
                emit YieldDonated(_donationHistory.length - 1, donationRecipient, yieldGenerated, block.timestamp);
            }
        }

        _lastKnownAssets = totalAssets();
        lastHarvestTime = block.timestamp;

        return yieldGenerated;
    }

    // ============ View Functions ============
    
    function getVaultInfo() external view returns (GroupVaultTypes.VaultConfig memory) {
        return GroupVaultTypes.VaultConfig({
            name: name,
            asset: asset,
            strategy: underlyingVault,
            donationRecipient: donationRecipient,
            admin: admin,
            minDeposit: minDeposit,
            depositCap: depositCap,
            isPaused: isPaused
        });
    }

    function getMemberInfo(address member) external view returns (GroupVaultTypes.Member memory) {
        if (!_isMember[member]) revert MemberNotFound(member);
        return _members[member];
    }

    function getPerformance() external view returns (GroupVaultTypes.PerformanceReport memory) {
        return GroupVaultTypes.PerformanceReport({
            timestamp: block.timestamp,
            totalAssets: totalAssets(),
            totalShares: _totalShares,
            pricePerShare: _calculatePricePerShare(),
            yieldGenerated: cumulativeYield,
            yieldDonated: cumulativeDonations
        });
    }

    /**
     * @notice Get total assets managed by vault
     * @return Total assets in underlying vault + idle assets
     */
    function totalAssets() public view returns (uint256) {
        uint256 vaultShares = IERC20(underlyingVault).balanceOf(address(this));
        uint256 assetsInVault = IERC4626(underlyingVault).convertToAssets(vaultShares);
        uint256 idleAssets = IERC20(asset).balanceOf(address(this));
        return assetsInVault + idleAssets;
    }

    function totalShares() external view returns (uint256) {
        return _totalShares;
    }

    /**
     * @notice Convert assets to shares
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = _totalShares;
        if (supply == 0) {
            return assets; // 1:1 for first deposit
        }
        
        uint256 totalAssetsValue = totalAssets();
        if (totalAssetsValue == 0) {
            return assets;
        }
        
        return (assets * supply) / totalAssetsValue;
    }

    /**
     * @notice Convert shares to assets
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = _totalShares;
        if (supply == 0) {
            return 0;
        }
        
        return (shares * totalAssets()) / supply;
    }

    function getMembers() external view returns (address[] memory) {
        return _memberList;
    }

    function getDonationHistory() external view returns (GroupVaultTypes.DonationRecord[] memory) {
        return _donationHistory;
    }

    function isMember(address account) external view returns (bool) {
        return _isMember[account];
    }

    function sharesOf(address account) external view returns (uint256) {
        return _shares[account];
    }

    // ============ Internal Functions ============
    
    function _calculatePricePerShare() internal view returns (uint256) {
        if (_totalShares == 0) return PRECISION;
        return (totalAssets() * PRECISION) / _totalShares;
    }

    function _mint(address to, uint256 shares) internal {
        _totalShares += shares;
        _shares[to] += shares;
    }

    function _burn(address from, uint256 shares) internal {
        _totalShares -= shares;
        _shares[from] -= shares;
    }

    function _addMember(address member) internal {
        if (_isMember[member]) return;
        
        _isMember[member] = true;
        _memberList.push(member);
        
        _members[member] = GroupVaultTypes.Member({
            totalDeposited: 0,
            shares: 0,
            joinedAt: block.timestamp,
            isActive: true
        });

        emit MemberAdded(member, block.timestamp);
    }

    // ============ Admin Functions ============
    
    function updateDonationRecipient(address newRecipient) external onlyAdmin {
        if (newRecipient == address(0)) revert ZeroAddress();
        address oldRecipient = donationRecipient;
        donationRecipient = newRecipient;
        emit DonationRecipientUpdated(oldRecipient, newRecipient);
    }

    function updateMinDeposit(uint256 newMinDeposit) external onlyAdmin {
        uint256 oldAmount = minDeposit;
        minDeposit = newMinDeposit;
        emit MinDepositUpdated(oldAmount, newMinDeposit);
    }

    function pause() external onlyAdmin whenNotPaused {
        isPaused = true;
        emit VaultPause(admin, block.timestamp);
    }

    function unpause() external onlyAdmin whenPaused {
        isPaused = false;
        emit VaultUnpaused(admin, block.timestamp);
    }
}

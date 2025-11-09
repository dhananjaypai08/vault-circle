// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {GroupVaultTypes} from "../types/GroupVaultTypes.sol";

/**
 * @title IGroupVault
 * @notice Interface for Group Vault with Yield Donating Strategy (YDS)
 * @dev Combines ERC4626-style functionality with automatic yield donation
 */
interface IGroupVault {
    // ============ Events ============
    
    event VaultCreated(address indexed vault, string name, address indexed creator, address indexed asset);
    event Deposit(address indexed sender, address indexed receiver, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event MemberAdded(address indexed member, uint256 timestamp);
    event YieldHarvested(uint256 indexed reportId, uint256 yield, uint256 timestamp);
    event YieldDonated(uint256 indexed donationId, address indexed recipient, uint256 amount, uint256 timestamp);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event DonationRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event VaultPause(address indexed admin, uint256 timestamp);
    event VaultUnpaused(address indexed admin, uint256 timestamp);
    event MinDepositUpdated(uint256 oldAmount, uint256 newAmount);
    event DepositCapUpdated(uint256 oldCap, uint256 newCap);

    // ============ Custom Errors ============
    
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientDeposit(uint256 required, uint256 provided);
    error InsufficientShares(uint256 required, uint256 available);
    error Unauthorized();
    error VaultPaused();
    error VaultNotPaused();
    error DepositCapReached(uint256 cap, uint256 attempted);
    error InvalidStrategy();
    error MemberNotFound(address member);
    error TransferFailed();
    error InvalidVaultName();
    error InvalidMinDeposit();

    // ============ Core Vault Functions ============
    
    /**
     * @notice Deposit assets into the vault
     * @param assets Amount of assets to deposit
     * @param receiver Address that will receive shares
     * @return shares Amount of shares minted
     */
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    /**
     * @notice Withdraw assets from the vault
     * @param shares Amount of shares to burn
     * @param receiver Address that will receive assets
     * @param owner Address of share owner
     * @return assets Amount of assets withdrawn
     */
    function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assets);

    /**
     * @notice Harvest yield and donate to recipient
     * @dev Calculates yield since last harvest and mints shares to donation recipient
     * @return yieldGenerated Amount of yield harvested
     */
    function harvest() external returns (uint256 yieldGenerated);

    // ============ View Functions ============
    
    /**
     * @notice Get complete vault configuration
     * @return Vault configuration struct
     */
    function getVaultInfo() external view returns (GroupVaultTypes.VaultConfig memory);

    /**
     * @notice Get member information
     * @param member Address of member
     * @return Member information struct
     */
    function getMemberInfo(address member) external view returns (GroupVaultTypes.Member memory);

    /**
     * @notice Get vault performance metrics
     * @return Performance report struct
     */
    function getPerformance() external view returns (GroupVaultTypes.PerformanceReport memory);

    /**
     * @notice Get total assets in vault (including strategy)
     * @return Total assets
     */
    function totalAssets() external view returns (uint256);

    /**
     * @notice Get total shares issued
     * @return Total shares
     */
    function totalShares() external view returns (uint256);

    /**
     * @notice Convert assets to shares
     * @param assets Amount of assets
     * @return shares Equivalent shares
     */
    function convertToShares(uint256 assets) external view returns (uint256 shares);

    /**
     * @notice Convert shares to assets
     * @param shares Amount of shares
     * @return assets Equivalent assets
     */
    function convertToAssets(uint256 shares) external view returns (uint256 assets);

    /**
     * @notice Get list of all members
     * @return Array of member addresses
     */
    function getMembers() external view returns (address[] memory);

    /**
     * @notice Get donation history
     * @return Array of donation records
     */
    function getDonationHistory() external view returns (GroupVaultTypes.DonationRecord[] memory);

    // ============ Admin Functions ============
    
    /**
     * @notice Update strategy vault address
     * @param newStrategy New strategy address
     */
    function updateStrategy(address newStrategy) external;

    /**
     * @notice Update donation recipient
     * @param newRecipient New recipient address
     */
    function updateDonationRecipient(address newRecipient) external;

    /**
     * @notice Update minimum deposit amount
     * @param newMinDeposit New minimum deposit
     */
    function updateMinDeposit(uint256 newMinDeposit) external;

    /**
     * @notice Update deposit cap
     * @param newDepositCap New deposit cap (0 = unlimited)
     */
    function updateDepositCap(uint256 newDepositCap) external;

    /**
     * @notice Pause vault operations
     */
    function pause() external;

    /**
     * @notice Unpause vault operations
     */
    function unpause() external;
}

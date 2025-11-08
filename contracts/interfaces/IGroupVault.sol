// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {GroupVaultTypes} from "../types/GroupVaultTypes.sol";

/**
 * @title IGroupVault
 * @notice Interface for Group Vault with Yield Donating Strategy
 */
interface IGroupVault {
    // ============ Events ============
    
    event VaultCreated(address indexed vault, string name, address indexed creator, address indexed asset);
    event Deposit(address indexed sender, address indexed receiver, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, uint256 assets, uint256 shares);
    event MemberAdded(address indexed member, uint256 timestamp);
    event YieldHarvested(uint256 indexed reportId, uint256 yield, uint256 timestamp);
    event YieldDonated(uint256 indexed donationId, address indexed recipient, uint256 amount, uint256 timestamp);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event DonationRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event VaultPause(address indexed admin, uint256 timestamp);
    event VaultUnpaused(address indexed admin, uint256 timestamp);
    event MinDepositUpdated(uint256 oldAmount, uint256 newAmount);

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

    // ============ Functions ============
    
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function harvest() external returns (uint256 yieldGenerated);
    function getVaultInfo() external view returns (GroupVaultTypes.VaultConfig memory);
    function getMemberInfo(address member) external view returns (GroupVaultTypes.Member memory);
    function getPerformance() external view returns (GroupVaultTypes.PerformanceReport memory);
    function totalAssets() external view returns (uint256);
    function totalShares() external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function getMembers() external view returns (address[] memory);
}

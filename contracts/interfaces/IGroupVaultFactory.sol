// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGroupVaultFactory
 * @notice Interface for creating Group Vaults
 */
interface IGroupVaultFactory {
    // ============ Events ============
    
    event VaultCreated(
        address indexed vault,
        address indexed creator,
        string name,
        address indexed asset,
        address strategy,
        address donationRecipient
    );

    // ============ Custom Errors ============
    
    error ZeroAddress();
    error InvalidVaultName();
    error InvalidMinDeposit();

    // ============ Functions ============
    
    function createVault(
        string memory name,
        address asset,
        address strategy,
        address donationRecipient,
        uint256 minDeposit,
        uint256 depositCap
    ) external returns (address vault);

    function getVaultsByCreator(address creator) external view returns (address[] memory);
    function getAllVaults() external view returns (address[] memory);
    function getVaultCount() external view returns (uint256);
    function isVault(address vault) external view returns (bool);
}

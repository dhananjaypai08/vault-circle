// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGroupVaultFactory
 * @notice Interface for Group Vault Factory
 * @dev Factory pattern for deploying Group Vaults with YDS
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
    
    /**
     * @notice Create a new Group Vault
     * @param name Name of the vault
     * @param asset Underlying asset address (ERC20)
     * @param strategy Katana vault address (ERC4626)
     * @param donationRecipient Address to receive donated yields
     * @param minDeposit Minimum deposit amount
     * @param depositCap Maximum total deposits (0 for no cap)
     * @return vault Address of created vault
     */
    function createVault(
        string memory name,
        address asset,
        address strategy,
        address donationRecipient,
        uint256 minDeposit,
        uint256 depositCap
    ) external returns (address vault);

    /**
     * @notice Get all vaults created by a specific creator
     * @param creator Address of vault creator
     * @return Array of vault addresses
     */
    function getVaultsByCreator(address creator) external view returns (address[] memory);

    /**
     * @notice Get all vaults created by this factory
     * @return Array of all vault addresses
     */
    function getAllVaults() external view returns (address[] memory);

    /**
     * @notice Get total number of vaults created
     * @return Number of vaults
     */
    function getVaultCount() external view returns (uint256);

    /**
     * @notice Check if address is a vault created by this factory
     * @param vault Address to check
     * @return true if address is a factory-created vault
     */
    function isVault(address vault) external view returns (bool);
}

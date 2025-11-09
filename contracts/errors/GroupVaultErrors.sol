// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title GroupVaultErrors
 * @author Vault Circle Team
 * @custom:security-contact security@vault-circle.io
 * @notice Centralized custom errors for Group Vault system
 * @dev Using custom errors saves ~50 bytes per error vs require(condition, "string")
 *      following Octant-v2-core error pattern
 */

// ============================================
// GROUP VAULT STRATEGY ERRORS
// ============================================

/// @notice Thrown when attempting to deposit below minimum deposit requirement
/// @param required Minimum deposit amount required
/// @param provided Amount user attempted to deposit
error GroupVault__InsufficientDeposit(uint256 required, uint256 provided);

/// @notice Thrown when deposit cap would be exceeded
/// @param cap Maximum deposit capacity
/// @param attempted Total deposits after this deposit would complete
error GroupVault__DepositCapReached(uint256 cap, uint256 attempted);

/// @notice Thrown when trying to withdraw more shares than owned
/// @param required Shares requested to withdraw
/// @param available Shares actually owned by user
error GroupVault__InsufficientShares(uint256 required, uint256 available);

/// @notice Thrown when member not found in vault
/// @param member Address that was not found as vault member
error GroupVault__MemberNotFound(address member);

/// @notice Thrown when vault is paused
error GroupVault__VaultPaused();

/// @notice Thrown when trying to unpause a vault that's not paused
error GroupVault__VaultNotPaused();

/// @notice Thrown when invalid vault name provided (empty string)
error GroupVault__InvalidVaultName();

/// @notice Thrown when invalid minimum deposit (zero)
error GroupVault__InvalidMinDeposit();

/// @notice Thrown when ERC4626 strategy asset doesn't match vault asset
error GroupVault__InvalidStrategy();

/// @notice Thrown when harvest is called too soon after last harvest
/// @param timeSinceLastHarvest Time elapsed since last harvest
/// @param minimumInterval Minimum required interval
error GroupVault__HarvestTooSoon(uint256 timeSinceLastHarvest, uint256 minimumInterval);

/// @notice Thrown when trying to perform admin action without authorization
error GroupVault__NotAdmin();

/// @notice Thrown when trying to set invalid harvest interval (too short or too long)
/// @param interval Attempted interval
/// @param minAllowed Minimum allowed interval
/// @param maxAllowed Maximum allowed interval
error GroupVault__InvalidHarvestInterval(uint256 interval, uint256 minAllowed, uint256 maxAllowed);

// ============================================
// GROUP VAULT FACTORY ERRORS  
// ============================================

/// @notice Thrown when factory salt already used
/// @param salt Salt that was already used
error GroupVaultFactory__SaltAlreadyUsed(bytes32 salt);

/// @notice Thrown when querying vault that doesn't exist
/// @param vault Address that's not a vault
error GroupVaultFactory__VaultDoesNotExist(address vault);

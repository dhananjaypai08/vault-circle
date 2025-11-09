// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title GroupVaultConstants
 * @author Vault Circle Team
 * @custom:security-contact security@vault-circle.io
 * @notice Protocol-wide constants for Group Vault system
 * @dev Follows Octant-v2-core constants pattern
 */

/// @notice Minimum harvest interval (1 hour)
/// @dev Prevents harvest spamming and excessive gas costs
uint256 constant MIN_HARVEST_INTERVAL = 1 hours;

/// @notice Maximum harvest interval (30 days)
/// @dev Ensures yields are distributed regularly
uint256 constant MAX_HARVEST_INTERVAL = 30 days;

/// @notice Default harvest interval (1 day)
/// @dev Standard interval for automated harvest calls
uint256 constant DEFAULT_HARVEST_INTERVAL = 1 days;

/// @notice Maximum basis points (100%)
/// @dev Used for percentage calculations
uint256 constant MAX_BPS = 10_000;

/// @notice Minimum deposit amount (0.001 tokens with 18 decimals)
/// @dev Prevents dust deposits
uint256 constant MIN_DEPOSIT_AMOUNT = 1e15;

/// @notice Maximum members per vault
/// @dev Prevents unbounded gas costs in member enumeration
uint256 constant MAX_MEMBERS = 1000;

/// @notice Group Vault version
string constant GROUP_VAULT_VERSION = "1.0.0";

/// @notice Deterministic deployment salt for factories
/// @dev Used with CREATE2 for predictable addresses
bytes32 constant GROUP_VAULT_FACTORY_SALT = keccak256("GROUP_VAULT_FACTORY_V1");

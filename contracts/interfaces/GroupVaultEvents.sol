// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title GroupVaultEvents
 * @author Vault Circle Team
 * @custom:security-contact security@vault-circle.io
 * @notice Event definitions for Group Vault system
 * @dev Indexed parameters allow efficient off-chain filtering
 */

// ============================================
// GROUP VAULT STRATEGY EVENTS
// ============================================

/// @notice Emitted when a new vault is created
/// @param vault Address of created vault
/// @param creator Address that created the vault
/// @param name Vault name
/// @param asset Underlying asset address
/// @param strategy ERC4626 strategy address
/// @param donationRecipient Address receiving donated yields
event GroupVault__VaultCreated(
    address indexed vault,
    address indexed creator,
    string name,
    address indexed asset,
    address strategy,
    address donationRecipient
);

/// @notice Emitted when user deposits into vault
/// @param sender Address initiating deposit
/// @param receiver Address receiving shares
/// @param assets Amount of assets deposited
/// @param shares Amount of shares minted
event GroupVault__Deposit(
    address indexed sender,
    address indexed receiver,
    uint256 assets,
    uint256 shares
);

/// @notice Emitted when user withdraws from vault
/// @param sender Address initiating withdrawal
/// @param receiver Address receiving assets
/// @param owner Address whose shares are burned
/// @param assets Amount of assets withdrawn
/// @param shares Amount of shares burned
event GroupVault__Withdraw(
    address indexed sender,
    address indexed receiver,
    address indexed owner,
    uint256 assets,
    uint256 shares
);

/// @notice Emitted when new member joins vault
/// @param member Address of new member
/// @param timestamp When member joined
event GroupVault__MemberAdded(address indexed member, uint256 timestamp);

/// @notice Emitted when yields are harvested
/// @param reportId Unique identifier for this harvest
/// @param yieldGenerated Amount of yield harvested
/// @param timestamp When harvest occurred
event GroupVault__YieldHarvested(
    uint256 indexed reportId,
    uint256 yieldGenerated,
    uint256 timestamp
);

/// @notice Emitted when yields are donated
/// @param donationId Unique identifier for donation
/// @param recipient Address receiving donation
/// @param amount Amount donated
/// @param timestamp When donation occurred
event GroupVault__YieldDonated(
    uint256 indexed donationId,
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);

/// @notice Emitted when ERC4626 strategy is updated
/// @param oldStrategy Previous strategy address
/// @param newStrategy New strategy address
event GroupVault__StrategyUpdated(
    address indexed oldStrategy,
    address indexed newStrategy
);

/// @notice Emitted when donation recipient is updated
/// @param oldRecipient Previous recipient address
/// @param newRecipient New recipient address
event GroupVault__DonationRecipientUpdated(
    address indexed oldRecipient,
    address indexed newRecipient
);

/// @notice Emitted when vault is paused
/// @param admin Address that paused vault
/// @param timestamp When vault was paused
event GroupVault__VaultPaused(address indexed admin, uint256 timestamp);

/// @notice Emitted when vault is unpaused
/// @param admin Address that unpaused vault
/// @param timestamp When vault was unpaused
event GroupVault__VaultUnpaused(address indexed admin, uint256 timestamp);

/// @notice Emitted when minimum deposit is updated
/// @param oldAmount Previous minimum deposit
/// @param newAmount New minimum deposit
event GroupVault__MinDepositUpdated(uint256 oldAmount, uint256 newAmount);

/// @notice Emitted when deposit cap is updated
/// @param oldCap Previous deposit cap
/// @param newCap New deposit cap
event GroupVault__DepositCapUpdated(uint256 oldCap, uint256 newCap);

/// @notice Emitted when harvest interval is updated
/// @param oldInterval Previous harvest interval
/// @param newInterval New harvest interval
event GroupVault__HarvestIntervalUpdated(uint256 oldInterval, uint256 newInterval);

// ============================================
// GROUP VAULT FACTORY EVENTS
// ============================================

/// @notice Emitted when factory creates a new vault
/// @param vault Address of created vault
/// @param creator Address that created vault
/// @param asset Underlying asset
/// @param strategy ERC4626 strategy
/// @param salt Salt used for CREATE2 deployment
event GroupVaultFactory__VaultCreated(
    address indexed vault,
    address indexed creator,
    address indexed asset,
    address strategy,
    bytes32 salt
);

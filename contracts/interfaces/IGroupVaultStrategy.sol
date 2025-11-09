// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title IGroupVaultStrategy  
 * @author Vault Circle Team
 * @custom:security-contact security@vault-circle.io
 * @notice Interface for Group Vault Strategy with Yield Donating
 * @dev Extends Octant's YieldDonatingTokenizedStrategy pattern
 */
interface IGroupVaultStrategy {
    // ============================================
    // STRUCTS
    // ============================================

    /// @notice Configuration for a Group Vault
    /// @param name Vault name
    /// @param asset Underlying ERC20 asset
    /// @param strategy ERC4626 strategy vault address
    /// @param donationRecipient Address receiving donated yields
    /// @param admin Vault administrator
    /// @param minDeposit Minimum deposit amount
    /// @param depositCap Maximum total deposits (0 = unlimited)
    /// @param isPaused Whether vault operations are paused
    /// @param createdAt Vault creation timestamp
    /// @param harvestInterval Minimum time between harvests
    struct VaultConfig {
        string name;
        address asset;
        address strategy;
        address donationRecipient;
        address admin;
        uint256 minDeposit;
        uint256 depositCap;
        bool isPaused;
        uint256 createdAt;
        uint256 harvestInterval;
    }

    /// @notice Member information in vault
    /// @param isActive Whether member is active
    /// @param joinedAt Timestamp when joined
    /// @param shares Member's vault shares
    /// @param totalDeposited Total assets deposited
    struct Member {
        bool isActive;
        uint256 joinedAt;
        uint256 shares;
        uint256 totalDeposited;
    }

    /// @notice Performance metrics
    /// @param totalAssets Current total assets
    /// @param totalShares Total shares issued
    /// @param yieldGenerated Cumulative yield
    /// @param yieldDonated Cumulative donations
    /// @param pricePerShare Current share price
    /// @param memberCount Active members
    struct PerformanceReport {
        uint256 totalAssets;
        uint256 totalShares;
        uint256 yieldGenerated;
        uint256 yieldDonated;
        uint256 pricePerShare;
        uint256 memberCount;
    }

    /// @notice Donation record
    /// @param id Donation identifier
    /// @param amount Amount donated
    /// @param recipient Donation recipient
    /// @param timestamp When donation occurred
    /// @param yieldSourced Yield that sourced donation
    struct DonationRecord {
        uint256 id;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        uint256 yieldSourced;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /// @notice Get vault configuration
    /// @return Vault configuration struct
    function getVaultInfo() external view returns (VaultConfig memory);

    /// @notice Get member information
    /// @param member Member address
    /// @return Member information struct
    function getMemberInfo(address member) external view returns (Member memory);

    /// @notice Get performance metrics
    /// @return Performance report struct
    function getPerformance() external view returns (PerformanceReport memory);

    /// @notice Get all vault members
    /// @return Array of member addresses
    function getMembers() external view returns (address[] memory);

    /// @notice Get donation history
    /// @return Array of donation records
    function getDonationHistory() external view returns (DonationRecord[] memory);

    /// @notice Check if address is a member
    /// @param account Address to check
    /// @return True if account is member
    function isMember(address account) external view returns (bool);

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /// @notice Update ERC4626 strategy
    /// @param newStrategy New strategy address
    function updateStrategy(address newStrategy) external;

    /// @notice Update donation recipient
    /// @param newRecipient New recipient address
    function updateDonationRecipient(address newRecipient) external;

    /// @notice Update minimum deposit
    /// @param newMinDeposit New minimum amount
    function updateMinDeposit(uint256 newMinDeposit) external;

    /// @notice Update deposit cap
    /// @param newDepositCap New cap (0 = unlimited)
    function updateDepositCap(uint256 newDepositCap) external;

    /// @notice Update harvest interval
    /// @param newInterval New interval in seconds
    function updateHarvestInterval(uint256 newInterval) external;

    /// @notice Pause vault operations
    function pause() external;

    /// @notice Unpause vault operations
    function unpause() external;
}

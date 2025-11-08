// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GroupVaultTypes
 * @notice Custom data structures for the Group Vault system
 */
library GroupVaultTypes {
    /**
     * @notice Information about a group member
     */
    struct Member {
        uint256 totalDeposited;  // Total amount deposited by this member
        uint256 shares;          // Current share balance
        uint256 joinedAt;        // Timestamp when member joined
        bool isActive;           // Whether member is currently active
    }

    /**
     * @notice Configuration for a group vault
     */
    struct VaultConfig {
        string name;
        address asset;
        address strategy;
        address donationRecipient;
        address admin;
        uint256 minDeposit;
        uint256 depositCap;
        bool isPaused;
    }

    /**
     * @notice Snapshot of vault performance
     */
    struct PerformanceReport {
        uint256 timestamp;
        uint256 totalAssets;
        uint256 totalShares;
        uint256 pricePerShare;
        uint256 yieldGenerated;
        uint256 yieldDonated;
    }

    /**
     * @notice Details about a deposit transaction
     */
    struct DepositInfo {
        address member;
        uint256 amount;
        uint256 shares;
        uint256 timestamp;
    }

    /**
     * @notice Details about a withdrawal transaction
     */
    struct WithdrawInfo {
        address member;
        uint256 shares;
        uint256 amount;
        uint256 timestamp;
    }

    /**
     * @notice Donation record
     */
    struct DonationRecord {
        uint256 id;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        uint256 yieldSourced;
    }
}

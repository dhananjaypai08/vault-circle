// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GroupVaultTypes
 * @notice Type definitions for Group Vault system
 */
library GroupVaultTypes {
    
    /**
     * @notice Configuration for a Group Vault
     * @param name Vault name
     * @param asset Underlying asset address (ERC20)
     * @param strategy ERC4626 strategy vault address (Katana vault)
     * @param donationRecipient Address receiving donated yields
     * @param admin Vault administrator
     * @param minDeposit Minimum deposit amount required
     * @param depositCap Maximum total deposits (0 = unlimited)
     * @param isPaused Whether vault is paused
     * @param createdAt Vault creation timestamp
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
        uint256 createdAt;
    }

    /**
     * @notice Member information in the vault
     * @param isActive Whether member is active
     * @param joinedAt Timestamp when member joined
     * @param shares Member's vault shares
     * @param totalDeposited Total assets deposited by member
     */
    struct Member {
        bool isActive;
        uint256 joinedAt;
        uint256 shares;
        uint256 totalDeposited;
    }

    /**
     * @notice Performance tracking for the vault
     * @param totalAssets Current total assets in vault
     * @param totalShares Total vault shares issued
     * @param yieldGenerated Total yield generated
     * @param yieldDonated Total yield donated
     * @param pricePerShare Current share price (assets per share)
     * @param memberCount Number of active members
     */
    struct PerformanceReport {
        uint256 totalAssets;
        uint256 totalShares;
        uint256 yieldGenerated;
        uint256 yieldDonated;
        uint256 pricePerShare;
        uint256 memberCount;
    }

    /**
     * @notice Record of a donation event
     * @param id Donation ID
     * @param amount Amount donated
     * @param recipient Donation recipient
     * @param timestamp When donation occurred
     * @param yieldSourced Yield amount that sourced this donation
     */
    struct DonationRecord {
        uint256 id;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        uint256 yieldSourced;
    }
}

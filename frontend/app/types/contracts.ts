export interface VaultConfig {
  name: string;
  asset: `0x${string}`;
  strategy: `0x${string}`;
  donationRecipient: `0x${string}`;
  admin: `0x${string}`;
  minDeposit: bigint;
  depositCap: bigint;
  isPaused: boolean;
}

export interface Member {
  totalDeposited: bigint;
  shares: bigint;
  joinedAt: bigint;
  isActive: boolean;
}

export interface PerformanceReport {
  timestamp: bigint;
  totalAssets: bigint;
  totalShares: bigint;
  pricePerShare: bigint;
  yieldGenerated: bigint;
  yieldDonated: bigint;
}

export interface DonationRecord {
  id: bigint;
  amount: bigint;
  recipient: `0x${string}`;
  timestamp: bigint;
  yieldSourced: bigint;
}

export interface VaultInfo {
  address: `0x${string}`;
  name: string;
  asset: `0x${string}`;
  totalAssets: string;
  totalMembers: number;
  yieldDonated: string;
  admin: `0x${string}`;
}
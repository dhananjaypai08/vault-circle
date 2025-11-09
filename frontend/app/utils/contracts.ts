import { Address } from 'viem';

export const KATANA_CHAIN_ID = 129399;

// Contract Addresses from deployment
export const FACTORY_ADDRESS: Address = '0xa61C1E6114CAa48cc7aE5D35211559a731d0B4c9';
export const DONATION_RECIPIENT: Address = '0x541cc10d295671697ff7e8c841af097ed0ea3802';
export const YDS_STRATEGY: Address = '0x3C83eb770439ccE6F0238599E42b0D01713243Ed';
export const ADMIN: Address = '0x2a3942ebdd8c5ea3e66d3fc4301f56d0f15d4be2';
export const MORPHO_TOKENIZED_STRATEGY: Address = '0x3F1954BE3754F2c25C8d48f81F755C2164DFf6Df';

// Yearn Vault Address
export const YEARN_VAULT_ADDRESS: Address = '0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60';

// AUSD Token Address
export const AUSD_TOKEN_ADDRESS: Address = '0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC';

// Morpho Vault Factory 
export const GROUP_VAULT_FACTORY: Address = '0xc005D1a17721503c70b9fb88f29AaDD60f15a721';

// Strategy Factory 
export const STRATEGY_FACTORY: Address = '0xa61C1E6114CAa48cc7aE5D35211559a731d0B4c9';

export interface AssetConfig {
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress: Address;
  vaultAddress?: Address;
  description: string;
  icon: string;
  color: string;
}

// Asset configurations
export const ASSETS: Record<string, AssetConfig> = {
  AUSD: {
    name: 'Agora USD',
    symbol: 'AUSD',
    decimals: 6,
    tokenAddress: AUSD_TOKEN_ADDRESS,
    description: 'Agora stablecoin',
    icon: '💲',
    color: 'from-green-500 to-green-600',
    vaultAddress: '0x08A4aC9e28Ae741f3B25a2201775D4eEb464069a'
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    tokenAddress: '0x93358Fd354b9D8887DA94ea70683dB156Fc5F0D4',
    description: 'USDC',
    icon: '💲',
    color: 'from-green-500 to-green-600',
    vaultAddress: '0x08A4aC9e28Ae741f3B25a2201775D4eEb464069a'
  },
};

// Helper functions
export const getAssetConfig = (symbol: string): AssetConfig | undefined => {
  return ASSETS[symbol];
};

export const getAllAssets = (): AssetConfig[] => {
  return Object.values(ASSETS);
};

// Yearn Vault ABI - Based on IYvAUSD interface
export const YEARN_VAULT_ABI = [
  // ERC20 functions
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ERC4626 functions
  {
    inputs: [],
    name: 'asset',
    outputs: [{ name: 'assetTokenAddress', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: 'totalManagedAssets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'receiver', type: 'address' }],
    name: 'maxDeposit',
    outputs: [{ name: 'maxAssets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'maxWithdraw',
    outputs: [{ name: 'maxAssets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'maxRedeem',
    outputs: [{ name: 'maxShares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Yearn-specific functions
  {
    inputs: [],
    name: 'depositLimit',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositLimitModule',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyShutdown',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'targetFloatPercent',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewards',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Performance tracking (typical in Yearn vaults)
  {
    inputs: [],
    name: 'pricePerShare',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Factory and Vault ABIs for the Group Vault system
export const FACTORY_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'asset', type: 'address' },
      { name: 'strategy', type: 'address' },
      { name: 'donationRecipient', type: 'address' },
      { name: 'minDeposit', type: 'uint256' },
      { name: 'depositCap', type: 'uint256' },
    ],
    name: 'createVault',
    outputs: [{ name: 'vault', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getVaultsByCreator',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllVaults',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVaultCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'vault', type: 'address' }],
    name: 'isVault',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const VAULT_ABI = [
  {
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVaultInfo',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'asset', type: 'address' },
          { name: 'strategy', type: 'address' },
          { name: 'donationRecipient', type: 'address' },
          { name: 'minDeposit', type: 'uint256' },
          { name: 'depositCap', type: 'uint256' },
          { name: 'totalDeposits', type: 'uint256' },
          { name: 'isPaused', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPerformance',
    outputs: [
      {
        components: [
          { name: 'totalYield', type: 'uint256' },
          { name: 'totalDonated', type: 'uint256' },
          { name: 'lastHarvest', type: 'uint256' },
          { name: 'averageAPY', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'member', type: 'address' }],
    name: 'getMemberInfo',
    outputs: [
      {
        components: [
          { name: 'totalDeposited', type: 'uint256' },
          { name: 'shares', type: 'uint256' },
          { name: 'joinedAt', type: 'uint256' },
          { name: 'lastDeposit', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMembers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDonationHistory',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'yieldSourced', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'isMember',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const ERC4626_ABI = [
  {
    inputs: [],
    name: 'asset',
    outputs: [{ name: 'assetTokenAddress', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: 'totalManagedAssets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const MORPHO_COMPOUNDER_FACTORY_ABI = [
  {
    inputs: [
      { name: "_name", type: "string" },
      { name: "_management", type: "address" },
      { name: "_keeper", type: "address" },
      { name: "_emergencyAdmin", type: "address" },
      { name: "_donationAddress", type: "address" },
      { name: "_enableBurning", type: "bool" },
      { name: "_tokenizedStrategyAddress", type: "address" },
    ],
    name: "createStrategy",
    outputs: [{ name: "strategyAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "deployer", type: "address" }],
    name: "getStrategiesByDeployer",
    outputs: [
      {
        components: [
          { name: "deployerAddress", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "vaultTokenName", type: "string" },
          { name: "donationAddress", type: "address" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "deployer", type: "address" },
      { indexed: true, name: "donationAddress", type: "address" },
      { indexed: true, name: "strategyAddress", type: "address" },
      { indexed: false, name: "vaultTokenName", type: "string" },
    ],
    name: "StrategyDeploy",
    type: "event",
  },
] as const;

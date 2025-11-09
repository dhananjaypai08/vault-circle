import { Address } from 'viem';

export const KATANA_CHAIN_ID = 747474;

export const FACTORY_ADDRESS: Address = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address) || '0x0000000000000000000000000000000000000000';

// ============================================
// Asset Configuration with ERC20 Tokens + Katana Vaults
// ============================================

export interface AssetConfig {
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress: Address;  // Underlying ERC20 token
  vaultAddress: Address;  // Katana ERC4626 vault (strategy)
  description: string;
  icon: string;
  color: string;
}

// Asset Token Addresses on Katana (you'll need to verify/update these)
const ASSET_TOKENS = {
  USDC: '0x876aac7648D79f87245E73316eB2D100e75F3Df1', // TODO: Add actual USDC token address on Katana
  MORPHO: '0x1e5eFCA3D0dB2c6d5C67a4491845c43253eB9e4e', // TODO: Add actual USDT token address on Katana  
  WETH: '0x9893989433e7a383Cb313953e4c2365107dc19a7', // TODO: Add actual WETH token address on Katana
  WBTC: '0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072', // TODO: Add actual WBTC token address on Katana
  AUSD: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a', // TODO: Add actual USDS token address on Katana
} as const;

// Katana bvb Vault Addresses (ERC4626 strategies)
const KATANA_VAULTS = {
  USDC: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36', // IbvbUSDC
  USDT: '0x2DCa96907fde857dd3D816880A0df407eeB2D2F2', // IbvbUSDT
  WETH: '0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62', // IbvbEth
  WBTC: '0x0913DA6Da4b42f538B445599b46Bb4622342Cf52', // IbvbWBTC
  USDS: '0x62D6A123E8D19d06d68cf0d2294F9A3A0362c6b3', // IbvbUSDS
} as const;

export const ASSETS: Record<string, AssetConfig> = {
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    tokenAddress: ASSET_TOKENS.USDC,
    vaultAddress: KATANA_VAULTS.USDC,
    description: 'Stable, reliable digital dollar',
    icon: '💵',
    color: 'from-blue-500 to-blue-600',
  },
  AUSD: {
    name: 'Agora USD',
    symbol: 'AUSD',
    decimals: 6,
    tokenAddress: ASSET_TOKENS.AUSD,
    vaultAddress: KATANA_VAULTS.USDT,
    description: 'World\'s largest stablecoin',
    icon: '💲',
    color: 'from-green-500 to-green-600',
  },
  WETH: {
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    tokenAddress: ASSET_TOKENS.WETH,
    vaultAddress: KATANA_VAULTS.WETH,
    description: 'Tokenized Ethereum',
    icon: '⟠',
    color: 'from-purple-500 to-purple-600',
  },
  WBTC: {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    tokenAddress: ASSET_TOKENS.WBTC,
    vaultAddress: KATANA_VAULTS.WBTC,
    description: 'Bitcoin on Ethereum',
    icon: '₿',
    color: 'from-orange-500 to-orange-600',
  },
  MORPHO: {
    name: 'MorphoBlue',
    symbol: 'MORPHO',
    decimals: 18,
    tokenAddress: ASSET_TOKENS.MORPHO,
    vaultAddress: KATANA_VAULTS.USDS,
    description: 'Morpho protocol stablecoin',
    icon: '🌟',
    color: 'from-cyan-500 to-cyan-600',
  },
};

// Helper to get asset config
export const getAssetConfig = (symbol: string): AssetConfig | undefined => {
  return ASSETS[symbol];
};

// ============================================
// ABIs
// ============================================

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
    name: 'harvest',
    outputs: [{ name: 'yieldGenerated', type: 'uint256' }],
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
          { name: 'admin', type: 'address' },
          { name: 'minDeposit', type: 'uint256' },
          { name: 'depositCap', type: 'uint256' },
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
    inputs: [{ name: 'member', type: 'address' }],
    name: 'getMemberInfo',
    outputs: [
      {
        components: [
          { name: 'totalDeposited', type: 'uint256' },
          { name: 'shares', type: 'uint256' },
          { name: 'joinedAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
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
          { name: 'timestamp', type: 'uint256' },
          { name: 'totalAssets', type: 'uint256' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'pricePerShare', type: 'uint256' },
          { name: 'yieldGenerated', type: 'uint256' },
          { name: 'yieldDonated', type: 'uint256' },
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
    name: 'totalAssets',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', type: 'uint256' }],
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
    name: 'asset',
    outputs: [{ name: '', type: 'address' }],
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
] as const;
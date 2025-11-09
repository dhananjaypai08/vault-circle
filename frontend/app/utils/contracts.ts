import { Address } from 'viem';

export const KATANA_CHAIN_ID = 747474;

export const FACTORY_ADDRESS: Address = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address) || '0x0000000000000000000000000000000000000000';

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

const ASSET_TOKENS = {
  // bvUSD (BitVault USD) - This is actually what was incorrectly labeled as USDC
  BVUSD: '0x876aac7648D79f87245E73316eB2D100e75F3Df1' as Address,
  
  // MORPHO token
  MORPHO: '0x1e5eFCA3D0dB2c6d5C67a4491845c43253eB9e4e' as Address,
  
  // weETH (Wrapped eETH from EtherFi)
  WEETH: '0x9893989433e7a383Cb313953e4c2365107dc19a7' as Address,
  
  // wstETH (Wrapped stETH from Lido)  
  WSTETH: '0x7Fb4D0f51544F24F385a421Db6e7D4fC71Ad8e5C' as Address,
  
  // JitoSOL (Jito Staked SOL)
  JITOSOL: '0x6C16E26013f2431e8B2e1Ba7067ECCcad0Db6C52' as Address,
  
  // WBTC
  WBTC: '0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072' as Address,
  
  // AUSD (Agora USD)
  AUSD: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a' as Address,
} as const;

// ============================================
// Katana ERC4626 Vault Addresses (Strategies)
// These are the bvb vault addresses from KatanaConstants
// ============================================
const KATANA_VAULTS = {
  // IbvbETH - Katana ETH vault
  ETH: '0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62' as Address,
  
  // IbvbUSDC - NOTE: You need to find the actual USDC token address
  // The vault exists but we need the underlying USDC token address
  USDC: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36' as Address,
  
  // IbvbUSDS
  USDS: '0x62D6A123E8D19d06d68cf0d2294F9A3A0362c6b3' as Address,
  
  // IbvbUSDT - NOTE: You need to find the actual USDT token address
  USDT: '0x2DCa96907fde857dd3D816880A0df407eeB2D2F2' as Address,
  
  // IbvbWBTC
  WBTC: '0x0913DA6Da4b42f538B445599b46Bb4622342Cf52' as Address,
} as const;

export const ASSETS: Record<string, AssetConfig> = {
  BVUSD: {
    name: 'BitVault USD',
    symbol: 'bvUSD',
    decimals: 18, // Verify decimals from contract
    tokenAddress: ASSET_TOKENS.BVUSD,
    vaultAddress: KATANA_VAULTS.USDS, // Using USDS vault as it's a stablecoin
    description: 'BitVault USD stablecoin',
    icon: '💵',
    color: 'from-blue-500 to-blue-600',
  },
  MORPHO: {
    name: 'Morpho',
    symbol: 'MORPHO',
    decimals: 18,
    tokenAddress: ASSET_TOKENS.MORPHO,
    vaultAddress: KATANA_VAULTS.USDS, // Can use USDS vault or ETH vault
    description: 'Morpho protocol governance token',
    icon: '🔷',
    color: 'from-indigo-500 to-indigo-600',
  },
  WEETH: {
    name: 'Wrapped eETH',
    symbol: 'weETH',
    decimals: 18,
    tokenAddress: ASSET_TOKENS.WEETH,
    vaultAddress: KATANA_VAULTS.ETH,
    description: 'EtherFi wrapped staked ETH',
    icon: '⟠',
    color: 'from-purple-500 to-purple-600',
  },
  WSTETH: {
    name: 'Wrapped stETH',
    symbol: 'wstETH',
    decimals: 18,
    tokenAddress: ASSET_TOKENS.WSTETH,
    vaultAddress: KATANA_VAULTS.ETH,
    description: 'Lido wrapped staked ETH',
    icon: '🔹',
    color: 'from-cyan-500 to-cyan-600',
  },
  JITOSOL: {
    name: 'Jito Staked SOL',
    symbol: 'JitoSOL',
    decimals: 9, // Solana typically uses 9 decimals
    tokenAddress: ASSET_TOKENS.JITOSOL,
    vaultAddress: KATANA_VAULTS.ETH, // Using ETH vault as proxy
    description: 'Jito staked SOL token',
    icon: '☀️',
    color: 'from-orange-500 to-orange-600',
  },
  WBTC: {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    tokenAddress: ASSET_TOKENS.WBTC,
    vaultAddress: KATANA_VAULTS.WBTC,
    description: 'Bitcoin on Ethereum',
    icon: '₿',
    color: 'from-amber-500 to-amber-600',
  },
  AUSD: {
    name: 'Agora USD',
    symbol: 'AUSD',
    decimals: 6,
    tokenAddress: ASSET_TOKENS.AUSD,
    vaultAddress: KATANA_VAULTS.USDS,
    description: 'Agora stablecoin',
    icon: '💲',
    color: 'from-green-500 to-green-600',
  },
};

// Helper to get asset config
export const getAssetConfig = (symbol: string): AssetConfig | undefined => {
  return ASSETS[symbol];
};

// Helper to get all available assets
export const getAllAssets = (): AssetConfig[] => {
  return Object.values(ASSETS);
};


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

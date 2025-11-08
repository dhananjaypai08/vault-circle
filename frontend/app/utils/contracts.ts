import { Address } from 'viem';

// Katana Mainnet Chain ID
export const KATANA_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || 747474;

// Contract Addresses - UPDATE THESE AFTER DEPLOYMENT
export const FACTORY_ADDRESS: Address = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

// Katana Vault Strategies (ERC4626)
export const KATANA_VAULTS = {
  USDC: '0x203A662b0BD271A6ed5a60EdFbd04bFce608FD36',
  USDT: '0x2DCa96907fde857dd3D816880A0df407eeB2D2F2',
  ETH: '0xEE7D8BCFb72bC1880D0Cf19822eB0A2e6577aB62',
  WBTC: '0x0913DA6Da4b42f538B445599b46Bb4622342Cf52',
  USDS: '0x62D6A123E8D19d06d68cf0d2294F9A3A0362c6b3',
} as const;

// Asset Information
export const ASSETS = {
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    vault: KATANA_VAULTS.USDC,
  },
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    vault: KATANA_VAULTS.USDT,
  },
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    vault: KATANA_VAULTS.ETH,
  },
  WBTC: {
    symbol: 'WBTC',
    decimals: 8,
    vault: KATANA_VAULTS.WBTC,
  },
  USDS: {
    symbol: 'USDS',
    decimals: 18,
    vault: KATANA_VAULTS.USDS,
  },
} as const;

// GroupVaultFactory ABI
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
] as const;

// GroupVault ABI
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
    name: 'getMembers',
    outputs: [{ name: '', type: 'address[]' }],
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
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
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
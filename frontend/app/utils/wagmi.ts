import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { KATANA_CHAIN_ID } from './contracts';

// Define Katana mainnet
export const katana = defineChain({
  id: Number(KATANA_CHAIN_ID),
  name: 'Katana',
  network: 'katana',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.katana.network'],
    },
    public: {
      http: ['https://rpc.katana.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Katana Explorer',
      url: 'https://explorer.katana.network',
    },
  },
  contracts: {},
});

export const config = getDefaultConfig({
  appName: 'Group Vault',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [katana],
  ssr: true,
});
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const katanaTestnet = defineChain({
  id: 129399,
  name: 'Katana Testnet',
  network: 'katana-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tatara.katanarpc.com'],
    },
    public: {
      http: ['https://rpc.tatara.katanarpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Katana Testnet Explorer',
      url: 'https://rpc.tatara.katanarpc.com',
    },
  },
  contracts: {},
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Group Vault with Yearn',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [katanaTestnet],
  ssr: true,
});
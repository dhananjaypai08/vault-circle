'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, connectorsForWallets, ConnectButton } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, coinbaseWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { katanaTestnet } from '../utils/wagmi';

// Configure connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Group Vault',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  }
);

// Create wagmi config
const config = createConfig({
  chains: [katanaTestnet],
  connectors,
  transports: {
    [katanaTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#10b981',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">V</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Group Vault</h1>
                    <p className="text-xs text-slate-400">Katana Testnet</p>
                  </div>
                </div>
                <ConnectButton />
              </div>
            </header>

            {/* Main Content */}
            {children}

            {/* Footer */}
            <footer className="border-t border-slate-800 bg-slate-950/50 mt-20">
              <div className="max-w-7xl mx-auto px-8 py-8 text-center text-slate-400 text-sm">
                <p>Built on Katana Testnet • Powered by Yearn Finance</p>
                <p className="mt-2 text-xs text-slate-500">
                  Explorer:{' '}
                  <a
                    href="https://rpc.tatara.katanarpc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    rpc.tatara.katanarpc.com
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import CreateVaultForm from './components/CreateVaultForm';
import VaultList from './components/VaultList';
import VaultDetail from './components/VaultDetail';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const { isConnected } = useAccount();
  const [selectedVault, setSelectedVault] = useState<`0x${string}` | null>(null);
  const [activeTab, setActiveTab] = useState<'vaults' | 'create'>('vaults');

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--color-border)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
                <h1 className="text-xl font-semibold tracking-tight">Group Vault</h1>
              </div>
              
              {isConnected && !selectedVault && (
                <div className="hidden md:flex items-center gap-1 bg-[var(--color-muted)] rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('vaults')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'vaults'
                        ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                    }`}
                  >
                    Vaults
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'create'
                        ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                    }`}
                  >
                    Create
                  </button>
                </div>
              )}
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      {!isConnected ? (
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Pool Capital,
                <br />
                <span className="gradient-text">Donate Yields</span>
              </h2>
              <p className="text-lg text-[var(--color-muted-foreground)]">
                Create collaborative investment vaults with friends. Maintain your principal
                while automatically donating all yields to public goods, DAOs, or charities.
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center">
              <ConnectButton />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Connect your wallet to get started on Katana mainnet
              </p>
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Permissionless',
                  description: 'Anyone can create a vault with custom parameters',
                },
                {
                  title: 'Yield Donating',
                  description: 'All profits automatically donated to chosen recipients',
                },
                {
                  title: 'Principal Protected',
                  description: 'Members maintain full access to their deposits',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] space-y-2"
                >
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedVault ? (
        <div className="container mx-auto px-6 py-8 animate-fade-in">
          <button
            onClick={() => setSelectedVault(null)}
            className="mb-6 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to vaults
          </button>
          <VaultDetail vaultAddress={selectedVault} />
        </div>
      ) : (
        <div className="container mx-auto px-6 py-8">
          {/* Mobile tab switcher */}
          <div className="md:hidden mb-6 flex items-center gap-1 bg-[var(--color-muted)] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('vaults')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'vaults'
                  ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              Vaults
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              Create
            </button>
          </div>

          <div className="animate-slide-up">
            {activeTab === 'vaults' ? (
              <VaultList onSelectVault={setSelectedVault} />
            ) : (
              <CreateVaultForm onSuccess={() => setActiveTab('vaults')} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
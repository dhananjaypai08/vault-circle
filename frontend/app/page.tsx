'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import CreateVaultForm from './components/CreateVaultForm';
import VaultList from './components/VaultList';
import VaultDetail from './components/VaultDetail';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const [selectedVault, setSelectedVault] = useState<`0x${string}` | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold tracking-tight">GroupVault</h1>
            
            {isConnected && !selectedVault && !showCreateForm && (
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
                >
                  Vaults
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  Create Vault
                </button>
              </nav>
            )}
          </div>
          
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {!isConnected ? (
          <div className="container mx-auto px-6 py-32">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-5xl font-bold tracking-tight">
                Collaborative Yield Donation Vaults
              </h2>
              <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed">
                Pool funds with your group. Generate yields through DeFi strategies. 
                Automatically donate profits to chosen recipients. All on-chain, all transparent.
              </p>
              <div className="flex justify-center pt-4">
                <ConnectButton />
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-muted)] flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 border-2 border-current rounded" />
                  </div>
                  <h3 className="font-semibold">ERC-4626 Standard</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Built on battle-tested vault standards with full compatibility
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-muted)] flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 border-2 border-current rounded-full" />
                  </div>
                  <h3 className="font-semibold">Automated Donations</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Yields automatically donated on-chain to configured recipients
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-muted)] flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 border-2 border-current" />
                  </div>
                  <h3 className="font-semibold">Katana Strategies</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Leverage proven yield strategies on Katana network
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedVault ? (
          <div className="container mx-auto px-6 py-8">
            <VaultDetail 
              vaultAddress={selectedVault} 
              onBack={() => setSelectedVault(null)} 
            />
          </div>
        ) : showCreateForm ? (
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              >
                ← Back to Vaults
              </button>
            </div>
            <CreateVaultForm onSuccess={() => setShowCreateForm(false)} />
          </div>
        ) : (
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Vaults</h2>
                <p className="text-[var(--color-muted-foreground)] mt-1">
                  Browse and manage group vaults
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Vault
              </Button>
            </div>
            <VaultList onSelectVault={setSelectedVault} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold">GroupVault</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Yield-donating strategy vaults for collaborative giving
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Create Vault</a></li>
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Browse Vaults</a></li>
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-[var(--color-foreground)] transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Network</h4>
              <ul className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                <li>Katana (747474)</li>
                <li>ERC-4626 Compatible</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] mt-8 pt-8 flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
            <p>© 2025 GroupVault. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Terms</a>
              <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
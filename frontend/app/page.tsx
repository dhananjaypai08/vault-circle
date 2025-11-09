'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import CreateVaultForm from './components/CreateVaultForm';
import VaultList from './components/VaultList';
import VaultDetail from './components/VaultDetail';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();
  const [selectedVault, setSelectedVault] = useState<`0x${string}` | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold tracking-tight">vault-circle</h1>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {!isConnected ? (
          <div className="container mx-auto px-6 py-32 text-center space-y-8">
            <h2 className="text-5xl font-bold tracking-tight">Collaborative Yield Vaults</h2>
            <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl mx-auto">
              Pool funds with your group. Generate yields through DeFi strategies. Automatically donate profits to chosen recipients.
            </p>
            <div className="flex justify-center pt-4">
              <ConnectButton />
            </div>
          </div>
        ) : selectedVault ? (
          <div className="container mx-auto px-6 py-8">
            <VaultDetail vaultAddress={selectedVault} onBack={() => setSelectedVault(null)} />
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
          <div className="container mx-auto px-6 py-8 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <h2 className="text-4xl font-bold tracking-tight">Manage Group Vaults</h2>
              <p className="text-[var(--color-muted-foreground)] text-lg max-w-2xl mx-auto">
                Create and manage collaborative vaults powered by Katana.
              </p>
            </section>

            {/* Yearn Vault CTA */}
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/10 p-8 text-center">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
                    <TrendingUp className="h-6 w-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Yearn AUSD Vault</h3>
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      Deposit AUSD and earn automated yield through Yearn Finance.
                    </p>
                  </div>
                </div>
                <Link href="/yearn-vault">
                  <Button className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Open Yearn Vault
                  </Button>
                </Link>
              </div>
            </section>

            {/* Vault List */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Vaults</h2>
                  <p className="text-[var(--color-muted-foreground)] mt-1">
                    Browse and manage group vaults
                  </p>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Vault
                </Button>
              </div>
              <VaultList onSelectVault={setSelectedVault} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="container mx-auto px-6 py-8 text-sm text-[var(--color-muted-foreground)] flex justify-between">
          <p>© 2025 vault-circle</p>
          <p>Built with octant-v2 • Katana</p>
        </div>
      </footer>
    </div>
  );
}

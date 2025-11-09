'use client';

import YearnVaultCard from '../components/YearnVaultCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function YearnVaultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
      <nav className="sticky top-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Yearn AUSD Vault</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Earn with Yearn</h2>
          <p className="text-[var(--color-muted-foreground)] text-lg">
            Deposit AUSD into the Yearn Vault to earn automated yield with minimal effort.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <YearnVaultCard />
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] py-8 text-center text-sm text-[var(--color-muted-foreground)]">
        Powered by Yearn Finance • Katana Network
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, ASSETS } from '../utils/contracts';
import { parseInputAmount } from '../utils/utils';
import { Address } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface CreateVaultFormProps {
  onSuccess: () => void;
}

export default function CreateVaultForm({ onSuccess }: CreateVaultFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    asset: 'USDC' as keyof typeof ASSETS,
    donationRecipient: '',
    minDeposit: '',
    depositCap: '',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assetInfo = ASSETS[formData.asset];
    const minDeposit = parseInputAmount(formData.minDeposit, assetInfo.decimals);
    const depositCap = formData.depositCap
      ? parseInputAmount(formData.depositCap, assetInfo.decimals)
      : 0n;

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [
        formData.name,
        assetInfo.vault as Address,
        assetInfo.vault as Address,
        formData.donationRecipient as Address,
        minDeposit,
        depositCap,
      ],
    });
  };

  if (isSuccess) {
    setTimeout(() => onSuccess(), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Vault</h2>
        <p className="text-[var(--color-muted-foreground)]">
          Set up a collaborative vault where yields are donated to your chosen recipient
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vault Configuration</CardTitle>
          <CardDescription>
            Configure your vault parameters. All fields are required unless noted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vault Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Vault Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Friends USDC Vault"
                required
              />
              <p className="text-xs text-[var(--color-muted-foreground)]">
                A friendly name for your vault
              </p>
            </div>

            <Separator />

            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">
                Asset
              </Label>
              <select
                id="asset"
                value={formData.asset}
                onChange={(e) =>
                  setFormData({ ...formData, asset: e.target.value as keyof typeof ASSETS })
                }
                className="flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm transition-colors hover:border-[var(--color-border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                required
              >
                {Object.keys(ASSETS).map((asset) => (
                  <option key={asset} value={asset} className="bg-[var(--color-card)]">
                    {asset}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Choose the asset type for deposits
              </p>
            </div>

            <Separator />

            {/* Donation Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">
                Donation Recipient
              </Label>
              <Input
                id="recipient"
                value={formData.donationRecipient}
                onChange={(e) => setFormData({ ...formData, donationRecipient: e.target.value })}
                placeholder="0x..."
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Address that will receive all donated yields
              </p>
            </div>

            <Separator />

            {/* Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">
                  Minimum Deposit
                </Label>
                <Input
                  id="minDeposit"
                  type="text"
                  value={formData.minDeposit}
                  onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                  placeholder="100"
                  required
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Minimum amount per deposit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositCap">Deposit Cap</Label>
                <Input
                  id="depositCap"
                  type="text"
                  value={formData.depositCap}
                  onChange={(e) => setFormData({ ...formData, depositCap: e.target.value })}
                  placeholder="0 (unlimited)"
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Maximum total deposits (optional)
                </p>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                loading={isPending || isConfirming}
                disabled={isPending || isConfirming}
                className="w-full"
                size="lg"
              >
                {isPending || isConfirming ? 'Creating Vault...' : 'Create Vault'}
              </Button>

              {isSuccess && (
                <div className="p-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-sm text-center">
                  Vault created successfully! Redirecting...
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
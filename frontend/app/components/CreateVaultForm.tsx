'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MORPHO_COMPOUNDER_FACTORY_ABI, ASSETS, getAssetConfig, YDS_STRATEGY, STRATEGY_FACTORY, FACTORY_ABI } from '../utils/contracts';
import { parseInputAmount } from '../utils/utils';
import { Address } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { useAccount } from 'wagmi';

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
  const { address: userAddress, isConnected } = useAccount();

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const selectedAsset = getAssetConfig(formData.asset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset) return;

    const minDeposit = parseInputAmount(formData.minDeposit, selectedAsset.decimals);
    const depositCap = formData.depositCap
      ? parseInputAmount(formData.depositCap, selectedAsset.decimals)
      : 0n;
    console.log(formData.name, selectedAsset.tokenAddress, selectedAsset.vaultAddress, formData.donationRecipient, minDeposit, depositCap)
    writeContract({
      address: "0x6eEcd2C4E5B47ef96758cc6edb208Dd8D3d813a1",
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [
        formData.name,
        selectedAsset.tokenAddress,
        selectedAsset.vaultAddress as `0x${string}`,
        formData.donationRecipient as Address,
        minDeposit,
        depositCap,
      ],
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onSuccess();
      setFormData({
        name: '',
        asset: 'USDC',
        donationRecipient: '',
        minDeposit: '',
        depositCap: '',
      });
    }, 2000);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Create Vault</h2>
        <p className="text-[var(--color-muted-foreground)]">
          Configure a new group vault with automated yield donations
        </p>
      </div>

      <Card className="border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Vault Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vault Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Vault Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Climate Action Fund"
                required
              />
            </div>

            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <select
                id="asset"
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value as keyof typeof ASSETS })}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                required
              >
                {Object.keys(ASSETS).map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
              {selectedAsset && (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Strategy: Katana {selectedAsset.symbol} Vault (Auto-selected)
                </p>
              )}
            </div>

            {/* Donation Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Donation Recipient</Label>
              <Input
                id="recipient"
                value={formData.donationRecipient}
                onChange={(e) => setFormData({ ...formData, donationRecipient: e.target.value })}
                placeholder="0x..."
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Address that will receive all generated yields
              </p>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Minimum Deposit</Label>
                <div className="relative">
                  <Input
                    id="minDeposit"
                    type="text"
                    value={formData.minDeposit}
                    onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                    placeholder="100"
                    required
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                    {selectedAsset?.symbol}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositCap">Deposit Cap (Optional)</Label>
                <div className="relative">
                  <Input
                    id="depositCap"
                    type="text"
                    value={formData.depositCap}
                    onChange={(e) => setFormData({ ...formData, depositCap: e.target.value })}
                    placeholder="0 = unlimited"
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                    {selectedAsset?.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Transaction Failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                type="submit"
                loading={isPending || isConfirming}
                disabled={isPending || isConfirming || !selectedAsset}
                className="w-full"
              >
                {isPending || isConfirming ? 'Creating Vault...' : 'Create Vault'}
              </Button>

              {isSuccess && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Vault created successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { VAULT_ABI, ASSETS } from '../utils/contracts';
import { formatAddress, formatAmount } from '../utils/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

interface VaultCardProps {
  address: Address;
  onSelect: () => void;
}

export default function VaultCard({ address, onSelect }: VaultCardProps) {
  const { data: vaultInfo, isLoading: isLoadingInfo } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getVaultInfo',
  });

  const { data: performance, isLoading: isLoadingPerf } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getPerformance',
  });

  const { data: members, isLoading: isLoadingMembers } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getMembers',
  });

  const assetConfig = vaultInfo?.strategy
    ? Object.values(ASSETS).find(a => (a as any).vaultAddress.toLowerCase() === vaultInfo.strategy.toLowerCase())
    : undefined;

  const decimals = assetConfig?.decimals || 18;
  const isLoading = isLoadingInfo || isLoadingPerf || isLoadingMembers;

  if (isLoading) {
    return (
      <Card className="border-[var(--color-border)]">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vaultInfo || !performance) return null;

  const totalAssets = (performance as any).totalAssets || 0n;
  const yieldDonated = (performance as any).yieldDonated || 0n;
  const memberCount = members?.length || 0;

  return (
    <Card
      onClick={onSelect}
      className="group cursor-pointer transition-all hover:border-[var(--color-accent)] border-[var(--color-border)]"
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">
              {vaultInfo.name}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] font-mono">
              {formatAddress(address)}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-accent)] transition-colors" />
        </div>

        {/* Asset Badge */}
        {assetConfig && (
          <div className="inline-flex items-center rounded-md bg-[var(--color-muted)] px-2.5 py-0.5 text-xs font-semibold">
            {assetConfig.symbol}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-[var(--color-muted-foreground)]">Total Value</p>
            <p className="text-lg font-semibold font-mono">
              {formatAmount(totalAssets, decimals, 2)}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {assetConfig?.symbol || 'tokens'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[var(--color-muted-foreground)]">Members</p>
            <p className="text-lg font-semibold">{memberCount}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {/* Yield Donated */}
        <div className="pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-muted-foreground)]">Yield Donated</p>
            <div className="text-right">
              <p className="text-sm font-semibold font-mono">
                {formatAmount(yieldDonated, decimals, 4)}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {assetConfig?.symbol || 'tokens'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
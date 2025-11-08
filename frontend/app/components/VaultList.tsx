'use client';

import { useAccount, useReadContract } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI, VAULT_ABI } from '../utils/contracts';
import { formatAddress, formatAmount } from '../utils/utils';
import { Address } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface VaultListProps {
  onSelectVault: (address: `0x${string}`) => void;
}

function VaultCard({ address, onSelect }: { address: Address; onSelect: () => void }) {
  const { data: vaultInfo } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getVaultInfo',
  });

  const { data: totalAssets } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'totalAssets',
  });

  const { data: performance } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getPerformance',
  });

  const { data: members } = useReadContract({
    address,
    abi: VAULT_ABI,
    functionName: 'getMembers',
  });

  if (!vaultInfo) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">{vaultInfo.name}</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] font-mono">
              {formatAddress(address)}
            </p>
          </div>
          {vaultInfo.isPaused && <Badge variant="warning">Paused</Badge>}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Total Assets</p>
            <p className="text-lg font-semibold font-mono">
              {formatAmount(totalAssets || 0n, 18, 2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Yield Donated</p>
            <p className="text-lg font-semibold font-mono text-[var(--color-success)]">
              {formatAmount(performance?.yieldDonated || 0n, 18, 2)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-muted-foreground)]">
            {members?.length || 0} member{members?.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[var(--color-accent)] font-medium">View details →</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VaultList({ onSelectVault }: VaultListProps) {
  const { address } = useAccount();

  const { data: allVaults, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getAllVaults',
  });

  const { data: myVaults } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getVaultsByCreator',
    args: address ? [address] : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Separator />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!allVaults || allVaults.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[var(--color-muted-foreground)]"
          >
            <path
              d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No vaults yet</h3>
          <p className="text-[var(--color-muted-foreground)]">
            Be the first to create a group vault
          </p>
        </div>
      </div>
    );
  }

  const hasMyVaults = myVaults && myVaults.length > 0;

  return (
    <div className="space-y-8">
      {hasMyVaults && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Vaults</h2>
            <p className="text-[var(--color-muted-foreground)]">
              Vaults you've created
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myVaults.map((vaultAddress) => (
              <VaultCard
                key={vaultAddress}
                address={vaultAddress}
                onSelect={() => onSelectVault(vaultAddress)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Vaults</h2>
          <p className="text-[var(--color-muted-foreground)]">
            Browse and join existing vaults
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allVaults.map((vaultAddress) => (
            <VaultCard
              key={vaultAddress}
              address={vaultAddress}
              onSelect={() => onSelectVault(vaultAddress)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
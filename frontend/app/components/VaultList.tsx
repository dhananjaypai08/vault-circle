'use client';

import { useAccount, useReadContract } from 'wagmi';
import { FACTORY_ADDRESS, FACTORY_ABI } from '../utils/contracts';
import { Address } from 'viem';
import VaultCard from './VaultCard';
import { Skeleton } from '@/components/ui/skeleton';

interface VaultListProps {
  onSelectVault: (address: Address) => void;
}

export default function VaultList({ onSelectVault }: VaultListProps) {
  const { address: userAddress } = useAccount();

  const { data: allVaults, isLoading: isLoadingAll } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getAllVaults',
  });

  const { data: myVaults, isLoading: isLoadingMy } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getVaultsByCreator',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const isLoading = isLoadingAll || isLoadingMy;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allVaults || allVaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-current rounded" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No vaults yet</h3>
          <p className="text-[var(--color-muted-foreground)] max-w-md">
            Create the first vault to get started with collaborative yield donations
          </p>
        </div>
      </div>
    );
  }

  const hasMyVaults = myVaults && myVaults.length > 0;

  return (
    <div className="space-y-12">
      {/* My Vaults */}
      {hasMyVaults && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">Your Vaults</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {myVaults.length} {myVaults.length === 1 ? 'vault' : 'vaults'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVaults.map((vaultAddress) => (
              <VaultCard
                key={vaultAddress}
                address={vaultAddress as Address}
                onSelect={() => onSelectVault(vaultAddress as Address)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Vaults */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">
            {hasMyVaults ? 'All Vaults' : 'Vaults'}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {allVaults.length} {allVaults.length === 1 ? 'vault' : 'vaults'} available
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVaults.map((vaultAddress) => (
            <VaultCard
              key={vaultAddress}
              address={vaultAddress as Address}
              onSelect={() => onSelectVault(vaultAddress as Address)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
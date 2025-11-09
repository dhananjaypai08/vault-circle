'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Address } from 'viem';
import { VAULT_ABI, ERC20_ABI, ASSETS } from '../utils/contracts';
import { formatAddress, formatAmount, parseInputAmount } from '../utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, Check, ExternalLink } from 'lucide-react';

interface VaultDetailProps {
  vaultAddress: Address;
  onBack: () => void;
}

export default function VaultDetail({ vaultAddress, onBack }: VaultDetailProps) {
  const { address: userAddress } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');

  // ---------------- READ CONTRACTS ----------------
  const { data: vaultInfo, isLoading: isLoadingInfo } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getVaultInfo',
  });

  const { data: performance, isLoading: isLoadingPerf } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getPerformance',
  });

  const { data: assetBalance, refetch: refetchBalance } = useReadContract({
    address: vaultInfo?.asset,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!vaultInfo?.asset },
  });

  const { data: allowance, refetch: refetchAllowance, isFetching: isFetchingAllowance } = useReadContract({
    address: vaultInfo?.asset,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, vaultAddress] : undefined,
    query: { enabled: !!userAddress && !!vaultInfo?.asset },
  });

  // ---------------- WRITE CONTRACTS ----------------
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: deposit, data: depositHash, isPending: isDepositing } = useWriteContract();

  // ---------------- TX RECEIPTS ----------------
  const { isLoading: isApproveConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  // ---------------- COMPUTED ----------------
  const assetConfig = useMemo(() => {
    if (!vaultInfo?.asset) return undefined;
    return Object.values(ASSETS).find(
      (a) => a.tokenAddress.toLowerCase() === vaultInfo.asset.toLowerCase()
    );
  }, [vaultInfo?.asset]);

  const decimals = assetConfig?.decimals || 18;

  // ⚡ Main fix: compute approval need reactively and safely
  const needsApproval = useMemo(() => {
    if (!depositAmount || !allowance) return true; // default to require approval until we know
    try {
      const amount = parseInputAmount(depositAmount, decimals);
      return amount > (allowance as bigint);
    } catch {
      return true;
    }
  }, [depositAmount, allowance, decimals]);

  // ---------------- HANDLERS ----------------
  const handleApprove = () => {
    if (!vaultInfo?.asset || !depositAmount) return;
    const amount = parseInputAmount(depositAmount, decimals);
    approve({
      address: vaultInfo.asset,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress, amount],
    });
  };

  const handleDeposit = () => {
    if (!userAddress || !depositAmount) return;
    const amount = parseInputAmount(depositAmount, decimals);
    deposit({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amount, userAddress],
    });
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (isApproved) refetchAllowance();
  }, [isApproved, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess) {
      setDepositAmount('');
      refetchBalance();
      refetchAllowance();
    }
  }, [isDepositSuccess, refetchBalance, refetchAllowance]);

  // ---------------- LOADING STATES ----------------
  if (isLoadingInfo || isLoadingPerf)
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (!vaultInfo || !performance) return null;
  console.log('performace', performance);
  const totalAssets = performance.averageAPY || 0n;
  const yieldDonated = performance.totalDonated || 0n;

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Vaults
      </Button>

      <Card className="border-[var(--color-border)]">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold">{vaultInfo.name}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
            {formatAddress(vaultAddress)}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">APY current</p>
              <p className="text-xl font-bold font-mono">{formatAmount(totalAssets, decimals, 2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">Yield Donated</p>
              <p className="text-xl font-bold font-mono">{formatAmount(yieldDonated, decimals, 4)}</p>
            </div>
          </div>

          {/* Deposit Section */}
          <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
            <Label htmlFor="deposit-amount">Deposit Amount</Label>
            <div className="relative">
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono pr-16"
              />
              {assetConfig?.symbol && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted-foreground)]">
                  {assetConfig.symbol}
                </span>
              )}
            </div>

            {/* ⚡ FIXED: Dynamic approve → deposit flow */}
            {needsApproval || isFetchingAllowance ? (
              <Button
                onClick={handleApprove}
                loading={isApproving || isApproveConfirming}
                disabled={isApproving || isApproveConfirming || !depositAmount}
                className="w-full"
              >
                {isApproveConfirming ? 'Confirming Approval...' : 'Approve Token'}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                loading={isDepositing || isDepositConfirming}
                disabled={isDepositing || isDepositConfirming || !depositAmount}
                className="w-full"
              >
                {isDepositConfirming ? 'Confirming Deposit...' : 'Deposit'}
              </Button>
            )}

            {/* Success messages */}
            {isApproved && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium">Token approved successfully</p>
                  {approveHash && (
                    <a
                      href={`https://explorer.tatara.katana.network/tx/${approveHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-accent)] hover:underline ml-auto"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {isDepositSuccess && (
              <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium">Deposit successful</p>
                  {depositHash && (
                    <a
                      href={`https://explorer.tatara.katana.network/tx/${depositHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--color-accent)] hover:underline ml-auto"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

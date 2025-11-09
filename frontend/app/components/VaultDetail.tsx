'use client';

import { useState, useMemo } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Address } from 'viem';
import { VAULT_ABI, ERC20_ABI, ASSETS } from '../utils/contracts';
import { formatAddress, formatAmount, parseInputAmount, formatDateTime } from '../utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';

interface VaultDetailProps {
  vaultAddress: Address;
  onBack: () => void;
}

export default function VaultDetail({ vaultAddress, onBack }: VaultDetailProps) {
  const { address: userAddress } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');

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

  const { data: memberInfo } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getMemberInfo',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: members } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getMembers',
  });

  const { data: assetBalance } = useReadContract({
    address: vaultInfo?.asset,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && !!vaultInfo?.asset },
  });

  const { data: allowance } = useReadContract({
    address: vaultInfo?.asset,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, vaultAddress] : undefined,
    query: { enabled: !!userAddress && !!vaultInfo?.asset },
  });

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: deposit, data: depositHash, isPending: isDepositing } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const assetConfig = useMemo(() => {
    if (!vaultInfo?.asset) return undefined;
    return Object.values(ASSETS).find(
      a => a.tokenAddress.toLowerCase() === vaultInfo.asset.toLowerCase()
    );
  }, [vaultInfo?.asset]);

  const decimals = assetConfig?.decimals || 18;

  const needsApproval = useMemo(() => {
    if (!depositAmount || !allowance) return false;
    try {
      const amount = parseInputAmount(depositAmount, decimals);
      return amount > (allowance as bigint);
    } catch {
      return false;
    }
  }, [depositAmount, allowance, decimals]);

  const handleApprove = () => {
    if (!vaultInfo?.asset) return;
    try {
      const amount = parseInputAmount(depositAmount, decimals);
      approve({
        address: vaultInfo.asset,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [vaultAddress, amount],
      });
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleDeposit = () => {
    if (!userAddress) return;
    try {
      const amount = parseInputAmount(depositAmount, decimals);
      deposit({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [amount, userAddress],
      });
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleWithdraw = () => {
    if (!userAddress) return;
    try {
      const shares = parseInputAmount(withdrawShares, decimals);
      withdraw({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [shares, userAddress, userAddress],
      });
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  if (isDepositSuccess) {
    setTimeout(() => setDepositAmount(''), 2000);
  }

  if (isWithdrawSuccess) {
    setTimeout(() => setWithdrawShares(''), 2000);
  }

  if (isLoadingInfo || isLoadingPerf) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!vaultInfo || !performance) return null;

  const isMember = memberInfo?.isActive || false;
  const totalAssets = performance.totalAssets || 0n;
  const yieldDonated = performance.yieldDonated || 0n;
  const pricePerShare = performance.pricePerShare || 0n;
  const memberCount = members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vaults
      </Button>

      {/* Vault Header */}
      <Card className="border-[var(--color-border)]">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{vaultInfo.name}</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] font-mono">
                {formatAddress(vaultAddress)}
              </p>
            </div>

            {assetConfig && (
              <div className="inline-flex items-center rounded-md bg-[var(--color-muted)] px-3 py-1 text-sm font-semibold">
                {assetConfig.symbol}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Total Value</p>
                <p className="text-3xl font-bold font-mono">
                  {formatAmount(totalAssets, decimals, 2)}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {assetConfig?.symbol || 'tokens'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Members</p>
                <p className="text-3xl font-bold">{memberCount}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Yield Donated</p>
                <p className="text-3xl font-bold font-mono">
                  {formatAmount(yieldDonated, decimals, 4)}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {assetConfig?.symbol || 'tokens'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Position */}
      {isMember && memberInfo && (
        <Card className="border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Shares</p>
                <p className="text-2xl font-bold font-mono">
                  {formatAmount(memberInfo.shares, decimals, 6)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Deposited</p>
                <p className="text-2xl font-bold font-mono">
                  {formatAmount(memberInfo.totalDeposited, decimals, 2)}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {assetConfig?.symbol}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Member Since</p>
                <p className="text-sm font-medium">{formatDateTime(memberInfo.joinedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="border-[var(--color-border)]">
        <CardHeader>
          <div className="flex gap-2 bg-[var(--color-muted)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveAction('deposit')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeAction === 'deposit'
                  ? 'bg-[var(--color-background)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveAction('withdraw')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeAction === 'withdraw'
                  ? 'bg-[var(--color-background)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
              disabled={!isMember}
            >
              Withdraw
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeAction === 'deposit' ? (
            <div className="space-y-6">
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Minimum: {formatAmount(vaultInfo.minDeposit, decimals, 2)} {assetConfig?.symbol}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Balance: {formatAmount(assetBalance || 0n, decimals, 4)} {assetConfig?.symbol}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="deposit-amount"
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    className="font-mono pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                    {assetConfig?.symbol}
                  </div>
                </div>
              </div>

              {needsApproval ? (
                <Button
                  onClick={handleApprove}
                  loading={isApproving || isApproveConfirming}
                  disabled={isApproving || isApproveConfirming}
                  className="w-full"
                >
                  Approve Token
                </Button>
              ) : (
                <Button
                  onClick={handleDeposit}
                  loading={isDepositing || isDepositConfirming}
                  disabled={isDepositing || isDepositConfirming || !depositAmount}
                  className="w-full"
                >
                  Deposit
                </Button>
              )}

              {isDepositSuccess && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium">Deposit successful</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {!isMember && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm">Deposit first to enable withdrawals</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdraw-shares">Shares</Label>
                <div className="relative">
                  <Input
                    id="withdraw-shares"
                    type="text"
                    value={withdrawShares}
                    onChange={(e) => setWithdrawShares(e.target.value)}
                    placeholder="0.0"
                    className="font-mono pr-16"
                    disabled={!isMember}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted-foreground)]">
                    Shares
                  </div>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Available: {formatAmount(memberInfo?.shares || 0n, decimals, 6)}
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                loading={isWithdrawing || isWithdrawConfirming}
                disabled={isWithdrawing || isWithdrawConfirming || !withdrawShares || !isMember}
                className="w-full"
                variant="destructive"
              >
                Withdraw
              </Button>

              {isWithdrawSuccess && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium">Withdrawal successful</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="border-[var(--color-border)]">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Asset</p>
                <p className="font-mono text-sm break-all">{vaultInfo.asset}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Strategy</p>
                <p className="font-mono text-sm break-all">{vaultInfo.strategy}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Donation Recipient</p>
                <p className="font-mono text-sm break-all">{vaultInfo.donationRecipient}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Price Per Share</p>
                <p className="font-mono text-sm">{formatAmount(pricePerShare, decimals, 8)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
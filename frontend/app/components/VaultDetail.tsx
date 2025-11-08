'use client';

import { useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Address } from 'viem';
import { VAULT_ABI, ERC20_ABI } from '../utils/contracts';
import { formatAddress, formatAmount, parseInputAmount, formatDateTime } from '../utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface VaultDetailProps {
  vaultAddress: Address;
}

export default function VaultDetail({ vaultAddress }: VaultDetailProps) {
  const { address: userAddress } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw'>('deposit');

  const { data: vaultInfo } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getVaultInfo',
  });

  const { data: performance } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getPerformance',
  });

  const { data: memberInfo } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getMemberInfo',
    args: userAddress ? [userAddress] : undefined,
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
  });

  const { data: allowance } = useReadContract({
    address: vaultInfo?.asset,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, vaultAddress] : undefined,
  });

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: deposit, data: depositHash, isPending: isDepositing } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const handleApprove = () => {
    if (!vaultInfo?.asset) return;
    const amount = parseInputAmount(depositAmount, 18);
    approve({
      address: vaultInfo.asset,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress, amount],
    });
  };

  const handleDeposit = () => {
    if (!userAddress) return;
    const amount = parseInputAmount(depositAmount, 18);
    deposit({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amount, userAddress],
    });
  };

  const handleWithdraw = () => {
    if (!userAddress) return;
    const shares = parseInputAmount(withdrawShares, 18);
    withdraw({
      address: vaultAddress,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [shares, userAddress, userAddress],
    });
  };

  if (!vaultInfo) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const needsApproval =
    depositAmount &&
    allowance !== undefined &&
    parseInputAmount(depositAmount, 18) > allowance;

  const isMember = memberInfo && memberInfo.shares > 0n;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Vault Overview */}
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{vaultInfo.name}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {formatAddress(vaultAddress)}
              </CardDescription>
            </div>
            {vaultInfo.isPaused && <Badge variant="warning">Paused</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Assets</p>
              <p className="text-3xl font-bold font-mono">
                {formatAmount(performance?.totalAssets || 0n, 18, 2)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[var(--color-muted-foreground)]">Total Yield Donated</p>
              <p className="text-3xl font-bold font-mono text-[var(--color-success)]">
                {formatAmount(performance?.yieldDonated || 0n, 18, 2)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[var(--color-muted-foreground)]">Members</p>
              <p className="text-3xl font-bold">{members?.length || 0}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                Donation Recipient
              </p>
              <p className="font-mono text-sm">{formatAddress(vaultInfo.donationRecipient)}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                Minimum Deposit
              </p>
              <p className="font-mono text-sm">
                {formatAmount(vaultInfo.minDeposit, 18, 2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Position */}
      {isMember && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
            <CardDescription>Your investment in this vault</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Shares</p>
                <p className="text-2xl font-bold font-mono">
                  {formatAmount(memberInfo.shares, 18, 6)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Total Deposited</p>
                <p className="text-2xl font-bold font-mono">
                  {formatAmount(memberInfo.totalDeposited, 18, 2)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--color-muted-foreground)]">Joined</p>
                <p className="text-sm">{formatDateTime(memberInfo.joinedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveAction('deposit')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeAction === 'deposit'
                  ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveAction('withdraw')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeAction === 'withdraw'
                  ? 'bg-[var(--color-card)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              Withdraw
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeAction === 'deposit' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input
                  id="deposit-amount"
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="font-mono text-lg"
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Balance: {formatAmount(assetBalance || 0n, 18, 4)}
                </p>
              </div>

              {needsApproval ? (
                <Button
                  onClick={handleApprove}
                  loading={isApproving || isApproveConfirming}
                  disabled={isApproving || isApproveConfirming}
                  className="w-full"
                  size="lg"
                >
                  Approve
                </Button>
              ) : (
                <Button
                  onClick={handleDeposit}
                  loading={isDepositing || isDepositConfirming}
                  disabled={isDepositing || isDepositConfirming || !depositAmount}
                  className="w-full"
                  size="lg"
                >
                  Deposit
                </Button>
              )}

              {isDepositSuccess && (
                <div className="p-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-sm text-center">
                  Deposit successful!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="withdraw-shares">Shares to Withdraw</Label>
                <Input
                  id="withdraw-shares"
                  type="text"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                  placeholder="0.0"
                  className="font-mono text-lg"
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Your Shares: {formatAmount(memberInfo?.shares || 0n, 18, 6)}
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                loading={isWithdrawing || isWithdrawConfirming}
                disabled={isWithdrawing || isWithdrawConfirming || !withdrawShares}
                className="w-full"
                size="lg"
              >
                Withdraw
              </Button>

              {isWithdrawSuccess && (
                <div className="p-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] text-sm text-center">
                  Withdrawal successful!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
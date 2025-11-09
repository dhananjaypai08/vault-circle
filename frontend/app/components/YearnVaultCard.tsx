'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import {
  YEARN_VAULT_ADDRESS,
  AUSD_TOKEN_ADDRESS,
  YEARN_VAULT_ABI,
  ERC20_ABI,
} from '../utils/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Wallet,
} from 'lucide-react';

export default function YearnVaultCard() {
  const { address: userAddress, isConnected } = useAccount();
  const [amount, setAmount] = useState('');

  // --- Reads ---
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: AUSD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: yvBalance, refetch: refetchYvBalance } = useReadContract({
    address: YEARN_VAULT_ADDRESS,
    abi: YEARN_VAULT_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: AUSD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, YEARN_VAULT_ADDRESS] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: pricePerShare } = useReadContract({
    address: YEARN_VAULT_ADDRESS,
    abi: YEARN_VAULT_ABI,
    functionName: 'pricePerShare',
  });

  // --- Writes ---
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();

  // --- Wait for tx receipts ---
  const { isLoading: isApproving, isSuccess: isApproved } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing, isSuccess: isDeposited } =
    useWaitForTransactionReceipt({ hash: depositHash });

  // --- Derived ---
  const formattedBalance = balance ? parseFloat(formatUnits(balance, 6)).toFixed(2) : '0.00';
  const formattedYvBalance = yvBalance ? parseFloat(formatUnits(yvBalance, 6)).toFixed(2) : '0.00';
  const apy = pricePerShare
    ? ((Number(formatUnits(pricePerShare, 6)) - 1) * 100).toFixed(2)
    : '8.5';

  const amountUnits = amount ? parseUnits(amount, 6) : 0n;
  const needsApproval = !allowance || (allowance && amountUnits > (allowance as bigint));

  // --- Handlers ---
  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    approve({
      address: AUSD_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [YEARN_VAULT_ADDRESS, parseUnits(amount, 6)],
    });
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    deposit({
      address: YEARN_VAULT_ADDRESS,
      abi: YEARN_VAULT_ABI,
      functionName: 'deposit',
      args: [parseUnits(amount, 6), userAddress as `0x${string}`],
    });
  };

  // Refresh after deposit
  useEffect(() => {
    if (isDeposited) {
      refetchBalance();
      refetchYvBalance();
      refetchAllowance();
      setAmount('');
    }
  }, [isDeposited, refetchBalance, refetchYvBalance, refetchAllowance]);

  useEffect(() => {
    if (isApproved) refetchAllowance();
  }, [isApproved, refetchAllowance]);

  // --- UI ---
  return (
    <Card className="border-[var(--color-border)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Yearn AUSD Vault</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Deposit AUSD to earn automated yield
            </p>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">{apy}% APY</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isConnected ? (
          <p className="text-center text-[var(--color-muted-foreground)] py-8">
            Connect your wallet to interact with the vault.
          </p>
        ) : (
          <>
            {/* Balances */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-md bg-[var(--color-muted)]/10 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted-foreground)]">AUSD Balance</p>
                <p className="text-lg font-semibold mt-1">{formattedBalance}</p>
              </div>
              <div className="p-3 rounded-md bg-[var(--color-muted)]/10 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted-foreground)]">yvAUSD Balance</p>
                <p className="text-lg font-semibold mt-1">{formattedYvBalance}</p>
              </div>
            </div>

            {/* Vault Address */}
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Vault Address:{' '}
              <a
                href={`https://explorer.tatara.katana.network/address/${YEARN_VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:underline"
              >
                {YEARN_VAULT_ADDRESS.slice(0, 6)}...{YEARN_VAULT_ADDRESS.slice(-4)}
              </a>
            </div>

            {/* Input */}
            <div>
              <label className="text-sm font-medium block mb-2">Deposit Amount (AUSD)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pr-16"
                />
                <button
                  onClick={() => setAmount(formattedBalance)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Approve/Deposit Button */}
            {needsApproval ? (
              <Button onClick={handleApprove} disabled={isApproving} className="w-full">
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Approving...
                  </>
                ) : isApproved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approved
                  </>
                ) : (
                  'Approve Vault'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                disabled={isDepositing || !amount || parseFloat(amount) <= 0}
                className="w-full"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Depositing...
                  </>
                ) : isDeposited ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Deposited!
                  </>
                ) : (
                  'Deposit'
                )}
              </Button>
            )}

            {/* Explorer Link */}
            {isDeposited && depositHash && (
              <div className="flex items-center justify-center gap-2 text-xs pt-2">
                <a
                  href={`https://explorer.tatara.katana.network/tx/${depositHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

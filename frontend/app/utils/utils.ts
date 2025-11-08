import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(
  amount: bigint,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function parseInputAmount(input: string, decimals: number): bigint {
  try {
    const cleaned = input.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const whole = parts[0] || '0';
    const fraction = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
    return BigInt(whole + fraction);
  } catch (error) {
    return 0n;
  }
}
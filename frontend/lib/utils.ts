import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { formatUnits, parseUnits } from 'viem';

/**
 * Format an address to a shorter version (0x1234...5678)
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format a large number to a readable string with commas
 */
export function formatAmount(amount: bigint | number | string, decimals = 18): string {
  try {
    const num = typeof amount === 'bigint' 
      ? parseFloat(formatUnits(amount, decimals))
      : typeof amount === 'string'
      ? parseFloat(amount)
      : amount;
    
    if (num === 0) return '0.00';
    if (num < 0.01) return '<0.01';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0.00';
  }
}

/**
 * Parse input amount to BigInt based on decimals
 */
export function parseInputAmount(amount: string, decimals = 18): bigint {
  try {
    if (!amount || amount === '') return BigInt(0);
    return parseUnits(amount, decimals);
  } catch (error) {
    console.error('Error parsing amount:', error);
    return BigInt(0);
  }
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDateTime(timestamp: bigint | number): string {
  try {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const date = new Date(ts * 1000);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  try {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'unknown';
  }
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: bigint | number, total: bigint | number): number {
  try {
    const partNum = typeof part === 'bigint' ? Number(part) : part;
    const totalNum = typeof total === 'bigint' ? Number(total) : total;
    
    if (totalNum === 0) return 0;
    return (partNum / totalNum) * 100;
  } catch (error) {
    console.error('Error calculating percentage:', error);
    return 0;
  }
}

/**
 * Format percentage with suffix
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Shorten a transaction hash
 */
export function formatTxHash(hash: string, chars = 6): string {
  if (!hash) return '';
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerTxUrl(hash: string, chainId = 129399): string {
  const explorers: Record<number, string> = {
    129399: 'https://rpc.tatara.katanarpc.com', // Katana Testnet
  };
  
  const baseUrl = explorers[chainId] || explorers[129399];
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Get explorer URL for address
 */
export function getExplorerAddressUrl(address: string, chainId = 129399): string {
  const explorers: Record<number, string> = {
    129399: 'https://rpc.tatara.katanarpc.com', // Katana Testnet
  };
  
  const baseUrl = explorers[chainId] || explorers[129399];
  return `${baseUrl}/address/${address}`;
}

/**
 * Validate ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format large numbers with suffixes (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(2)}M`;
  return `${(num / 1000000000).toFixed(2)}B`;
}

/**
 * Calculate APY from share price
 */
export function calculateAPY(currentPrice: number, initialPrice = 1, daysElapsed = 365): number {
  if (initialPrice === 0 || daysElapsed === 0) return 0;
  
  const dailyReturn = (currentPrice - initialPrice) / initialPrice / daysElapsed;
  const annualReturn = dailyReturn * 365;
  return annualReturn * 100;
}

/**
 * Format APY with color class
 */
export function getAPYColorClass(apy: number): string {
  if (apy < 5) return 'text-yellow-400';
  if (apy < 10) return 'text-green-400';
  return 'text-emerald-400';
}

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}
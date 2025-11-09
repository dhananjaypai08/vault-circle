import { Address } from 'viem';

/**
 * Format address to short form (0x1234...5678)
 */
export function formatAddress(address: Address | string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format amount with proper decimals and commas
 * @param amount - BigInt amount
 * @param decimals - Token decimals (6 for USDC/USDT, 8 for WBTC, 18 for ETH/USDS)
 * @param displayDecimals - Number of decimals to display
 */
export function formatAmount(
  amount: bigint | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  if (typeof amount === 'number') {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    });
  }

  if (amount === 0n) return '0';

  try {
    const divisor = BigInt(10 ** decimals);
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;

    // Format integer part with commas
    const integerStr = integerPart.toLocaleString('en-US');

    if (displayDecimals === 0) {
      return integerStr;
    }

    // Format fractional part
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const truncatedFractional = fractionalStr.slice(0, displayDecimals);

    // Remove trailing zeros
    const cleanedFractional = truncatedFractional.replace(/0+$/, '');

    if (cleanedFractional.length === 0) {
      return integerStr;
    }

    return `${integerStr}.${cleanedFractional}`;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
}

/**
 * Parse input amount string to BigInt with proper decimals
 * @param input - String input from user (e.g., "123.45")
 * @param decimals - Token decimals
 */
export function parseInputAmount(input: string, decimals: number = 18): bigint {
  if (!input || input === '') {
    throw new Error('Empty input');
  }

  // Remove commas and trim
  const cleanInput = input.replace(/,/g, '').trim();

  // Validate input
  if (!/^\d*\.?\d*$/.test(cleanInput)) {
    throw new Error('Invalid number format');
  }

  try {
    const [integerPart, fractionalPart = ''] = cleanInput.split('.');

    // Check if fractional part exceeds decimals
    if (fractionalPart.length > decimals) {
      throw new Error(`Too many decimal places. Max: ${decimals}`);
    }

    // Pad fractional part to match decimals
    const paddedFractional = fractionalPart.padEnd(decimals, '0');

    // Combine and convert to BigInt
    const combinedStr = integerPart + paddedFractional;
    return BigInt(combinedStr);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse amount');
  }
}

/**
 * Format Unix timestamp to human-readable date
 */
export function formatDateTime(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  
  if (ts === 0) return 'N/A';

  try {
    // Convert seconds to milliseconds
    const date = new Date(ts * 1000);
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format percentage with proper decimals
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: bigint, newValue: bigint): number {
  if (oldValue === 0n) return 0;
  
  const change = Number(newValue - oldValue);
  const base = Number(oldValue);
  
  return (change / base) * 100;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format APY/APR
 */
export function formatAPY(apy: number): string {
  if (apy === 0) return '0.00%';
  if (apy < 0.01) return '<0.01%';
  if (apy > 10000) return '>10,000%';
  return `${apy.toFixed(2)}%`;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash as Address, 6);
}

/**
 * Get explorer URL for address/tx
 */
export function getExplorerUrl(
  addressOrTx: string,
  type: 'address' | 'tx' = 'address',
  chainId: number = 747474
): string {
  // Katana explorer - update with actual explorer URL
  const baseUrl = 'https://explorer.katana.network'; // TODO: Update with actual explorer
  
  if (type === 'address') {
    return `${baseUrl}/address/${addressOrTx}`;
  }
  return `${baseUrl}/tx/${addressOrTx}`;
}
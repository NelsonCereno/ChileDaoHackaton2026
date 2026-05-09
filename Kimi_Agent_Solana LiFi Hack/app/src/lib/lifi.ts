import { createConfig, EVM, Solana, getQuote, executeRoute } from '@lifi/sdk';

// Li.Fi configuration
export const LIFI_CONFIG = {
  integrator: 'edumint',
  providers: [EVM(), Solana()],
};

// Supported chains for cross-chain payments
export interface ChainOption {
  id: number;
  name: string;
  icon: string;
}

export const SUPPORTED_CHAINS: ChainOption[] = [
  { id: 1, name: 'Ethereum', icon: 'ethereum' },
  { id: 8453, name: 'Base', icon: 'base' },
  { id: 42161, name: 'Arbitrum', icon: 'arbitrum' },
  { id: 137, name: 'Polygon', icon: 'polygon' },
  { id: 56, name: 'BSC', icon: 'bsc' },
];

// USDC on Solana
export const SOLANA_USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const SOLANA_CHAIN_ID = 1399811149;

// Initialize Li.Fi SDK
let initialized = false;
export function initLiFi() {
  if (initialized) return;
  try {
    createConfig(LIFI_CONFIG);
    initialized = true;
  } catch {
    // Already initialized or error
    initialized = true;
  }
}

export async function connectEvmWallet(): Promise<string | null> {
  const provider = (window as any)?.ethereum;
  if (!provider) return null;
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  return accounts?.[0] || null;
}

export interface QuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAddress: string;
  fromAddress: string;
}

export interface QuoteResult {
  route: any;
  fromAmount: string;
  toAmount: string;
  fromToken: { symbol: string; decimals: number };
  toToken: { symbol: string; decimals: number };
  gasCostUSD?: string;
  estimatedTime?: number;
}

// Get a cross-chain quote
export async function getCrossChainQuote(request: QuoteRequest): Promise<QuoteResult | null> {
  initLiFi();
  try {
    const quote = await getQuote({
      fromChain: request.fromChain,
      toChain: request.toChain,
      fromToken: request.fromToken,
      toToken: request.toToken,
      fromAmount: request.fromAmount,
      toAddress: request.toAddress,
      fromAddress: request.fromAddress,
    } as any);

    return {
      route: quote,
      fromAmount: request.fromAmount,
      toAmount: quote.estimate?.toAmount || '0',
      fromToken: { symbol: quote.action?.fromToken?.symbol || 'ETH', decimals: quote.action?.fromToken?.decimals || 18 },
      toToken: { symbol: quote.action?.toToken?.symbol || 'USDC', decimals: quote.action?.toToken?.decimals || 6 },
      gasCostUSD: quote.estimate?.gasCosts?.[0]?.amountUSD,
      estimatedTime: quote.estimate?.executionDuration,
    };
  } catch (error) {
    console.error('Li.Fi quote error:', error);
    return null;
  }
}

// Execute a cross-chain route
export async function executeCrossChainRoute(route: any): Promise<boolean> {
  initLiFi();
  try {
    await executeRoute(route, {
      updateRouteHook: (route: any) => {
        console.log('Route update:', route);
      },
    });
    return true;
  } catch (error) {
    console.error('Li.Fi execution error:', error);
    return false;
  }
}

// Format token amount from wei/lamports to human readable
export function formatTokenAmount(amount: string, decimals: number): string {
  const val = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = val / divisor;
  const fractionalPart = val % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.replace(/0+$/, '');
  return trimmed ? `${integerPart}.${trimmed}` : integerPart.toString();
}

// Native token addresses by chain
export const NATIVE_TOKEN: Record<number, string> = {
  1: '0x0000000000000000000000000000000000000000', // ETH
  8453: '0x0000000000000000000000000000000000000000', // Base ETH
  42161: '0x0000000000000000000000000000000000000000', // Arbitrum ETH
  137: '0x0000000000000000000000000000000000000000', // MATIC
  56: '0x0000000000000000000000000000000000000000', // BNB
};

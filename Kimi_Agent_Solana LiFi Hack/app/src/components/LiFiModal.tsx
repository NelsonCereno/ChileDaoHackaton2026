import { useState, useCallback } from 'react';
import { X, ArrowRight, Loader2, Zap } from 'lucide-react';
import {
  SUPPORTED_CHAINS,
  NATIVE_TOKEN,
  SOLANA_CHAIN_ID,
  SOLANA_USDC,
  getCrossChainQuote,
  formatTokenAmount,
  connectEvmWallet,
  executeCrossChainRoute,
} from '@/lib/lifi';
import type { QuoteResult } from '@/lib/lifi';
import { truncateAddress, lamportsToSOL, baseUnitsToUsdc } from '@/lib/solana';
import type { AcademicWork } from '@/lib/solana';

interface LiFiModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: AcademicWork;
  solanaAddress: string;
  onPaymentComplete: () => Promise<void> | void;
  disabled?: boolean;
}

export function LiFiModal({ isOpen, onClose, work, solanaAddress, onPaymentComplete, disabled = false }: LiFiModalProps) {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[1]); // Base
  const [fromAmount, setFromAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [step, setStep] = useState<'quote' | 'confirm' | 'executing' | 'success'>('quote');
  const [walletError, setWalletError] = useState('');

  const solPrice = parseFloat(lamportsToSOL(work.priceLamports));
  const usdcPrice = baseUnitsToUsdc(work.priceUsdc);

  const fetchQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    if (!solanaAddress) {
      setWalletError('Please connect your Solana wallet first.');
      return;
    }
    const address = await connectEvmWallet();
    if (!address) {
      setWalletError('Please connect an EVM wallet (MetaMask).');
      return;
    }
    setWalletError('');
    setLoading(true);
    setStep('quote');

    // Convert SOL price to wei (simplified for demo)
    const amountInWei = Math.floor(parseFloat(fromAmount) * 1e18).toString();

    const result = await getCrossChainQuote({
      fromChain: selectedChain.id,
      toChain: SOLANA_CHAIN_ID,
      fromToken: NATIVE_TOKEN[selectedChain.id],
      toToken: SOLANA_USDC,
      fromAmount: amountInWei,
      toAddress: solanaAddress,
      fromAddress: address,
    });

    setQuote(result);
    if (result) setStep('confirm');
    setLoading(false);
  }, [fromAmount, selectedChain, solanaAddress]);

  const executePayment = async () => {
    if (!quote) return;
    setExecuting(true);
    setStep('executing');

    const ok = await executeCrossChainRoute(quote.route);
    if (!ok) {
      setExecuting(false);
      setStep('confirm');
      return;
    }

    setStep('success');
    setExecuting(false);

    setTimeout(() => {
      Promise.resolve(onPaymentComplete()).finally(() => {
        onClose();
        setStep('quote');
        setQuote(null);
        setFromAmount('');
      });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#050505] border border-[#262626] w-full max-w-lg mx-4 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-[#ffd900]">
            {step === 'success' ? 'Payment Complete' : 'Select Payment Origin'}
          </h2>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#fbf5dc] transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'success' ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#ffd900]/10 flex items-center justify-center mx-auto">
              <Zap className="text-[#ffd900]" size={32} />
            </div>
            <p className="text-[#fbf5dc] text-lg">Cross-chain payment executed!</p>
            <p className="text-[#8a8a8a] text-sm">
              Professor received USDC on Solana. Access granted.
            </p>
          </div>
        ) : (
          <>
            {/* Work Info */}
            <div className="bg-[#0e0e0e] border border-[#262626] p-4 space-y-2">
              <p className="text-sm text-[#8a8a8a]">Accessing</p>
              <p className="font-display text-lg text-[#fbf5dc]">{work.title}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono-data text-[#ffd900]">{truncateAddress(work.professor)}</span>
                <span className="text-[#fbf5dc]">{solPrice} SOL / {usdcPrice} USDC</span>
              </div>
            </div>

            {/* Chain Selector */}
            <div className="space-y-3">
              <label className="text-sm text-[#8a8a8a]">From Chain</label>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      setSelectedChain(chain);
                      setQuote(null);
                      setStep('quote');
                    }}
                    className={`py-2 px-3 text-sm border transition-all ${
                      selectedChain.id === chain.id
                        ? 'border-[#ffd900] text-[#ffd900] bg-[#ffd900]/5'
                        : 'border-[#262626] text-[#8a8a8a] hover:border-[#404040]'
                    }`}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label className="text-sm text-[#8a8a8a]">Amount ({selectedChain.name} ETH)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setQuote(null);
                    setStep('quote');
                  }}
                  placeholder="0.0"
                  className="flex-1 bg-[#0e0e0e] border border-[#262626] px-4 py-3 text-[#fbf5dc] placeholder-[#404040] focus:border-[#ffd900] focus:outline-none transition-colors"
                />
                <button
                  onClick={fetchQuote}
                  disabled={loading || !fromAmount || disabled}
                  className="px-6 py-3 bg-[#262626] text-[#ffd900] border border-[#404040] hover:border-[#ffd900] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Quote'}
                </button>
              </div>
              {walletError && (
                <div className="text-xs text-red-400">{walletError}</div>
              )}
            </div>

            {/* To Chain (Fixed Solana) */}
            <div className="space-y-3">
              <label className="text-sm text-[#8a8a8a]">To Chain</label>
              <div className="bg-[#0e0e0e] border border-[#ffd900]/30 px-4 py-3 flex items-center justify-between">
                <span className="text-[#ffd900] font-medium">Solana</span>
                <span className="text-xs text-[#8a8a8a]">USDC</span>
              </div>
            </div>

            {/* Quote Display */}
            {quote && (
              <div className="bg-[#0e0e0e] border border-[#262626] p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8a8a8a]">You send</span>
                  <span className="text-[#fbf5dc]">{fromAmount} {quote.fromToken.symbol}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8a8a8a]">Professor receives</span>
                  <span className="text-[#ffd900] font-medium">
                    {formatTokenAmount(quote.toAmount, quote.toToken.decimals)} {quote.toToken.symbol}
                  </span>
                </div>
                {quote.gasCostUSD && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8a8a8a]">Gas cost</span>
                    <span className="text-[#fbf5dc]">${quote.gasCostUSD}</span>
                  </div>
                )}
                {quote.estimatedTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8a8a8a]">Estimated time</span>
                    <span className="text-[#fbf5dc]">~{Math.ceil(quote.estimatedTime / 60)} min</span>
                  </div>
                )}
                <div className="flex items-center justify-center py-2">
                  <ArrowRight size={16} className="text-[#ffd900]" />
                </div>
              </div>
            )}

            {/* Execute Button */}
            {step === 'confirm' && quote && (
              <button
                onClick={executePayment}
                disabled={executing || disabled}
                className="w-full py-4 grad-gold text-[#0e0e0e] font-semibold text-base hover:shadow-[0_0_40px_rgba(255,217,0,0.4)] transition-shadow disabled:opacity-50"
              >
                {executing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Executing Cross-Chain Swap...
                  </span>
                ) : (
                  'Bridge & Pay'
                )}
              </button>
            )}

            {step === 'executing' && (
              <div className="w-full py-4 bg-[#ffd900]/10 border border-[#ffd900]/30 text-[#ffd900] font-medium text-center">
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Processing via Li.Fi Protocol...
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

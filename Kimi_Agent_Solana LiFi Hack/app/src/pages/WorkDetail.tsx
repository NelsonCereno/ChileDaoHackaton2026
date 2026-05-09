import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ArrowLeft, Hash, Copy, Check, Calendar, Eye, Wallet, Loader2, Globe } from 'lucide-react';
import { getWorkById, lamportsToSOL, truncateAddress, accessWork } from '@/lib/solana';
import { MonolithicAvatar } from '@/components/MonolithicAvatar';
import { LiFiModal } from '@/components/LiFiModal';
import { ElectricConduitButton } from '@/components/ElectricConduitButton';
import type { AcademicWork } from '@/lib/solana';

export function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  const [work, setWork] = useState<AcademicWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessing, setAccessing] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showLiFi, setShowLiFi] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getWorkById(Number(id), connection);
      setWork(data);
      setLoading(false);
    }
    load();
  }, [id, connection]);

  const handleDirectPay = async () => {
    if (!connected || !publicKey || !work) {
      setError('Please connect your wallet');
      return;
    }
    setError('');
    setAccessing(true);
    try {
      const sig = await accessWork(connection, wallet as any, work);
      console.log('Transaction:', sig);
      setAccessGranted(true);
    } catch {
      setError('Transaction failed. Please try again.');
    }
    setAccessing(false);
  };

  const handleCrossChainPay = () => {
    if (!connected) {
      setError('Please connect your wallet');
      return;
    }
    setError('');
    setShowLiFi(true);
  };

  const copyHash = () => {
    if (!work) return;
    navigator.clipboard.writeText(work.contentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 size={32} className="text-[#ffd900] animate-spin" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl text-[#fbf5dc]">Work Not Found</h2>
          <p className="text-[#8a8a8a]">This academic work does not exist in the registry.</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 border border-[#262626] text-[#fbf5dc] hover:border-[#ffd900] hover:text-[#ffd900] transition-all"
          >
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  const solPrice = lamportsToSOL(work.priceLamports);
  const dateStr = new Date(work.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0e0e0e] pt-24 pb-16 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#ffd900] transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Archive</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Visual */}
          <div className="bg-[#050505] border border-[#262626] aspect-square flex items-center justify-center relative overflow-hidden">
            <MonolithicAvatar hash={work.contentHash} size={400} />
            <div className="absolute bottom-4 left-4 font-mono-data text-[10px] text-[#404040]">
              WORK #{work.workId.toString().padStart(4, '0')}
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            {/* Title & Author */}
            <div className="space-y-4">
              <h1 className="font-display text-4xl lg:text-5xl text-[#fbf5dc] leading-tight">
                {work.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#ffd900]/10 flex items-center justify-center">
                  <span className="font-mono-data text-xs text-[#ffd900]">DR</span>
                </div>
                <span className="font-mono-data text-sm text-[#ffd900]">
                  {truncateAddress(work.professor)}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#262626] py-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8a8a8a] text-xs">
                  <DollarSign size={12} />
                  <span>Price</span>
                </div>
                <p className="font-display text-2xl text-[#fbf5dc]">{solPrice} SOL</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8a8a8a] text-xs">
                  <Eye size={12} />
                  <span>Accesses</span>
                </div>
                <p className="font-display text-2xl text-[#fbf5dc]">{work.accessCount}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#8a8a8a] text-xs">
                  <Calendar size={12} />
                  <span>Registered</span>
                </div>
                <p className="text-sm text-[#fbf5dc]">{dateStr}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm text-[#8a8a8a] uppercase tracking-wider">Description</h3>
              <p className="text-[#fbf5dc] leading-relaxed">{work.description}</p>
            </div>

            {/* Content Hash */}
            <div className="space-y-3">
              <h3 className="text-sm text-[#8a8a8a] uppercase tracking-wider flex items-center gap-2">
                <Hash size={14} /> Content Hash (SHA-256)
              </h3>
              <div className="bg-[#050505] border border-[#262626] p-4 flex items-center justify-between gap-4">
                <span className="font-mono-data text-xs text-[#ffd900] break-all">
                  {work.contentHash}
                </span>
                <button
                  onClick={copyHash}
                  className="flex-shrink-0 text-[#404040] hover:text-[#ffd900] transition-colors"
                >
                  {copiedHash ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-[#404040]">
                This hash was computed client-side and stored on-chain as proof of existence.
              </p>
            </div>

            {/* Access Section */}
            {accessGranted ? (
              <div className="bg-[#ffd900]/5 border border-[#ffd900]/30 p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-[#ffd900]/10 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} className="text-[#ffd900]" />
                </div>
                <h3 className="font-display text-xl text-[#ffd900]">Access Granted</h3>
                <p className="text-sm text-[#8a8a8a]">
                  You now have verified access to this academic work. The content hash above authenticates the original document.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm text-[#8a8a8a] uppercase tracking-wider">Get Access</h3>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {!connected ? (
                  <div className="bg-[#050505] border border-[#262626] p-6 text-center space-y-3">
                    <Wallet size={24} className="text-[#404040] mx-auto" />
                    <p className="text-[#8a8a8a] text-sm">Connect your wallet to access this work</p>
                  </div>
                ) : (
                  <>
                    {/* Direct SOL Payment */}
                    <ElectricConduitButton
                      onClick={handleDirectPay}
                      loading={accessing}
                      className="w-full py-5"
                    >
                      Pay {solPrice} SOL on Solana
                    </ElectricConduitButton>

                    {/* Divider */}
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex-1 h-px bg-[#262626]" />
                      <span className="text-xs text-[#404040] uppercase">or</span>
                      <div className="flex-1 h-px bg-[#262626]" />
                    </div>

                    {/* Cross-Chain Payment */}
                    <button
                      onClick={handleCrossChainPay}
                      className="w-full py-4 bg-transparent border border-[#262626] text-[#fbf5dc] hover:border-[#ffd900] hover:text-[#ffd900] transition-all flex items-center justify-center gap-2"
                    >
                      <Globe size={16} />
                      Pay from Another Chain (Li.Fi)
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Li.Fi Modal */}
      {work && (
        <LiFiModal
          isOpen={showLiFi}
          onClose={() => setShowLiFi(false)}
          work={work}
          professorAddress={work.professor}
          onPaymentComplete={() => {
            setAccessGranted(true);
            setShowLiFi(false);
          }}
        />
      )}
    </div>
  );
}

function DollarSign(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

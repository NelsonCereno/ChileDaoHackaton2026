import { useState, useRef, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Hash, DollarSign, Loader2, BookOpen, Pencil, Copy, Check } from 'lucide-react';
import { computeSHA256 } from '@/lib/hash';
import { registerWork, getWorksByProfessor, lamportsToSOL, truncateAddress } from '@/lib/solana';
import { MonolithicAvatar } from '@/components/MonolithicAvatar';
import { ElectricConduitButton } from '@/components/ElectricConduitButton';
import type { AcademicWork } from '@/lib/solana';

export function Professor() {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [myWorks, setMyWorks] = useState<AcademicWork[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateWorkId, setUpdateWorkId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Load works when wallet connects
  const loadWorks = useCallback(async () => {
    if (!publicKey) return;
    const works = await getWorksByProfessor(publicKey.toString());
    setMyWorks(works);
  }, [publicKey]);

  // Load works on mount
  useState(() => {
    if (connected && publicKey) {
      loadWorks();
    }
  });

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert('Please upload a PDF or DOC file');
      return;
    }
    setFileName(file.name);
    setIsHashing(true);
    try {
      const hash = await computeSHA256(file);
      setFileHash(hash);
    } catch {
      alert('Error computing file hash');
    }
    setIsHashing(false);
  };

  const handleRegister = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }
    if (!title || !description || !fileHash || !price) {
      alert('Please fill in all fields');
      return;
    }

    setIsRegistering(true);
    try {
      const work = await registerWork(
        null as any,
        title,
        description,
        fileHash,
        Math.floor(parseFloat(price) * 1_000_000_000),
        publicKey
      );
      setMyWorks((prev) => [...prev, work]);
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setFileHash('');
      setFileName('');
    } catch (error) {
      console.error('Registration error:', error);
    }
    setIsRegistering(false);
  };

  const handleUpdatePrice = (workId: number) => {
    setUpdateWorkId(workId);
    const work = myWorks.find((w) => w.workId === workId);
    setNewPrice(work ? lamportsToSOL(work.priceLamports) : '');
    setShowUpdateModal(true);
  };

  const confirmUpdatePrice = () => {
    if (!updateWorkId || !newPrice) return;
    setMyWorks((prev) =>
      prev.map((w) =>
        w.workId === updateWorkId
          ? { ...w, priceLamports: Math.floor(parseFloat(newPrice) * 1_000_000_000) }
          : w
      )
    );
    setShowUpdateModal(false);
    setUpdateWorkId(null);
    setNewPrice('');
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <BookOpen className="text-[#ffd900] mx-auto" size={48} />
          <h2 className="font-display text-3xl text-[#fbf5dc]">Connect Your Wallet</h2>
          <p className="text-[#8a8a8a] max-w-sm">
            Please connect your Solana wallet to access the professor dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] pt-24 pb-16 px-6">
      <div className="max-w-[1200px] mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-[#ffd900]">Professor Dashboard</h1>
          <p className="text-[#8a8a8a]">
            Connected: <span className="font-mono-data text-[#ffd900]">{truncateAddress(publicKey?.toString() || '')}</span>
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-[#262626] border border-[#404040] p-8 space-y-8">
          <h2 className="font-display text-3xl text-[#ffd900]">Mint New Work</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm text-[#8a8a8a] flex items-center gap-2">
                <FileText size={14} /> Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Quantum Entanglement Study"
                maxLength={128}
                className="w-full bg-[#050505] border border-[#404040] px-4 py-3 text-[#fbf5dc] placeholder-[#404040] focus:border-[#ffd900] focus:outline-none transition-colors"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm text-[#8a8a8a] flex items-center gap-2">
                <DollarSign size={14} /> Price (SOL)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.05"
                min="0"
                step="0.001"
                className="w-full bg-[#050505] border border-[#404040] px-4 py-3 text-[#fbf5dc] placeholder-[#404040] focus:border-[#ffd900] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#8a8a8a]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your academic work..."
              maxLength={512}
              rows={4}
              className="w-full bg-[#050505] border border-[#404040] px-4 py-3 text-[#fbf5dc] placeholder-[#404040] focus:border-[#ffd900] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm text-[#8a8a8a]">Document (PDF/DOC)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full bg-[#050505] border-2 border-dashed cursor-pointer
                px-4 py-8 text-center transition-all
                ${isDragging
                  ? 'border-[#ffd900] bg-[#ffd900]/5'
                  : 'border-[#404040] hover:border-[#606060]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isHashing ? (
                <div className="flex items-center justify-center gap-2 text-[#ffd900]">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Computing SHA-256 hash...</span>
                </div>
              ) : fileHash ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[#ffd900]">
                    <Hash size={16} />
                    <span className="text-sm">{fileName}</span>
                  </div>
                  <div className="font-mono-data text-xs text-[#ffd900] break-all max-w-md mx-auto">
                    {fileHash}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={24} className="mx-auto text-[#404040]" />
                  <p className="text-[#8a8a8a] text-sm">Drop academic PDF/DOC here or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <ElectricConduitButton
            onClick={handleRegister}
            loading={isRegistering}
            disabled={!title || !description || !fileHash || !price}
            className="w-full py-5"
          >
            Register on Solana
          </ElectricConduitButton>
        </div>

        {/* My Works */}
        <div className="space-y-8">
          <h2 className="font-display text-3xl text-[#fbf5dc]">My Works Registry</h2>

          {myWorks.length === 0 ? (
            <div className="bg-[#050505] border border-[#262626] p-12 text-center">
              <BookOpen className="mx-auto text-[#404040] mb-4" size={32} />
              <p className="text-[#8a8a8a]">No works registered yet. Mint your first academic work above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myWorks.map((work) => (
                <div
                  key={work.workId}
                  className="bg-[#050505] border border-[#262626] hover:border-[#404040] transition-all p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <MonolithicAvatar hash={work.contentHash} size={80} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <h3
                      className="font-display text-xl text-[#fbf5dc] truncate cursor-pointer hover:text-[#ffd900] transition-colors"
                      onClick={() => navigate(`/work/${work.workId}`)}
                    >
                      {work.title}
                    </h3>
                    <p className="text-sm text-[#8a8a8a] line-clamp-1">{work.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-xs text-[#ffd900]">
                        {work.contentHash.slice(0, 16)}...{work.contentHash.slice(-16)}
                      </span>
                      <button
                        onClick={() => copyHash(work.contentHash)}
                        className="text-[#404040] hover:text-[#ffd900] transition-colors"
                      >
                        {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="font-display text-xl text-[#fbf5dc]">
                        {lamportsToSOL(work.priceLamports)} SOL
                      </div>
                      <div className="text-xs text-[#8a8a8a]">
                        {work.accessCount} accesses
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdatePrice(work.workId)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#404040] text-[#8a8a8a] text-sm hover:border-[#ffd900] hover:text-[#ffd900] transition-all btn-pill"
                    >
                      <Pencil size={12} />
                      Update Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Price Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUpdateModal(false)} />
          <div className="relative bg-[#050505] border border-[#262626] w-full max-w-md mx-4 p-6 space-y-6">
            <h3 className="font-display text-2xl text-[#ffd900]">Update Price</h3>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="New price in SOL"
              className="w-full bg-[#0e0e0e] border border-[#404040] px-4 py-3 text-[#fbf5dc] focus:border-[#ffd900] focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 py-3 border border-[#404040] text-[#8a8a8a] hover:border-[#606060] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdatePrice}
                className="flex-1 py-3 grad-gold text-[#0e0e0e] font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

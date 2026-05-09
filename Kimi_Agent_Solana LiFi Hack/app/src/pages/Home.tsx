import { Link } from 'react-router-dom';
import { BookOpen, Search, Coins, ArrowRight } from 'lucide-react';
import { MonolithicBackground } from '@/components/MonolithicBackground';
import { ElectricConduitButton } from '@/components/ElectricConduitButton';

export function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <MonolithicBackground />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <h1
            className="font-display text-[clamp(48px,10vw,144px)] leading-[1.1] text-[#ffd900] text-gold-glow tracking-[-0.02em] mb-6"
          >
            Notarize Knowledge
          </h1>
          <p className="text-[#fbf5dc] text-base md:text-lg max-w-[480px] mx-auto mb-10 leading-relaxed">
            The decentralized registry for academic works. Immutable proof of ownership on Solana.
          </p>
          <Link to="/explore">
            <ElectricConduitButton
              onClick={() => {}}
              className="btn-pill px-16 py-6 text-lg"
            >
              Enter the Archive
            </ElectricConduitButton>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8a8a8a]">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#ffd900] to-transparent" />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-[#0e0e0e] py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-[#fbf5dc] text-center mb-20 tracking-[-0.01em]">
            How It <span className="text-[#ffd900]">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group bg-[#050505] border border-[#262626] p-8 hover:border-[#ffd900]/40 transition-all duration-300">
              <div className="w-14 h-14 bg-[#ffd900]/10 flex items-center justify-center mb-6 group-hover:bg-[#ffd900]/20 transition-colors">
                <BookOpen className="text-[#ffd900]" size={24} />
              </div>
              <div className="font-mono-data text-xs text-[#ffd900] mb-3">STEP 01</div>
              <h3 className="font-display text-2xl text-[#fbf5dc] mb-4">Register</h3>
              <p className="text-[#8a8a8a] text-sm leading-relaxed">
                Professor uploads academic work. SHA-256 hash is computed client-side and stored on-chain as immutable proof of ownership.
              </p>
              <div className="mt-6 pt-6 border-t border-[#262626]">
                <div className="font-mono-data text-[10px] text-[#404040] break-all">
                  a1b2c3d4...e5f67890
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group bg-[#050505] border border-[#262626] p-8 hover:border-[#ffd900]/40 transition-all duration-300">
              <div className="w-14 h-14 bg-[#ffd900]/10 flex items-center justify-center mb-6 group-hover:bg-[#ffd900]/20 transition-colors">
                <Search className="text-[#ffd900]" size={24} />
              </div>
              <div className="font-mono-data text-xs text-[#ffd900] mb-3">STEP 02</div>
              <h3 className="font-display text-2xl text-[#fbf5dc] mb-4">Discover</h3>
              <p className="text-[#8a8a8a] text-sm leading-relaxed">
                Students browse the on-chain registry of verified academic works. Each entry carries cryptographic proof of authenticity.
              </p>
              <div className="mt-6 pt-6 border-t border-[#262626] flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-10 bg-[#262626] rounded-sm" />
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="group bg-[#050505] border border-[#262626] p-8 hover:border-[#ffd900]/40 transition-all duration-300">
              <div className="w-14 h-14 bg-[#ffd900]/10 flex items-center justify-center mb-6 group-hover:bg-[#ffd900]/20 transition-colors">
                <Coins className="text-[#ffd900]" size={24} />
              </div>
              <div className="font-mono-data text-xs text-[#ffd900] mb-3">STEP 03</div>
              <h3 className="font-display text-2xl text-[#fbf5dc] mb-4">Access</h3>
              <p className="text-[#8a8a8a] text-sm leading-relaxed">
                Student pays via Li.Fi from any EVM chain. Professor receives USDC on Solana. No intermediaries.
              </p>
              <div className="mt-6 pt-6 border-t border-[#262626] flex items-center justify-between">
                <span className="font-mono-data text-[10px] text-[#8a8a8a]">ETH</span>
                <ArrowRight size={12} className="text-[#ffd900]" />
                <span className="font-mono-data text-[10px] text-[#ffd900]">USDC.SOL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#050505] py-24 px-6 border-t border-[#262626]">
        <div className="max-w-[800px] mx-auto text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl text-[#fbf5dc]">
            Ready to <span className="text-[#ffd900]">monetize</span> your knowledge?
          </h2>
          <p className="text-[#8a8a8a] max-w-md mx-auto">
            Join the decentralized academic revolution. Register your works, set your price, and receive payments from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/professor">
              <ElectricConduitButton onClick={() => {}} className="btn-pill px-12 py-5">
                Register as Professor
              </ElectricConduitButton>
            </Link>
            <Link to="/explore">
              <button className="px-12 py-5 bg-transparent border border-[#262626] text-[#fbf5dc] btn-pill hover:border-[#ffd900] hover:text-[#ffd900] transition-all">
                Browse as Student
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-[#262626] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display text-xl text-[#ffd900]">EduMint</div>
          <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
            <span>Built for the future of academia</span>
            <span className="text-[#262626]">|</span>
            <span>Powered by Solana & Li.Fi</span>
          </div>
          <div className="font-mono-data text-xs text-[#404040]">
            2025 EduMint Protocol
          </div>
        </div>
      </footer>
    </div>
  );
}

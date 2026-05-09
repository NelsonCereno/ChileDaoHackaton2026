import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Coins, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Globe,
    title: 'Any Chain',
    description: 'Ethereum, Solana, Arbitrum, Base, and 20+ more supported out of the box.',
  },
  {
    icon: Coins,
    title: 'Any Token',
    description: 'Pay with what you hold. The protocol handles swaps and bridging invisibly.',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Finality on Solana in 400ms. No waiting, no pending transactions.',
  },
];

export default function CrossChainPayment() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Left text animation
    const leftEls = sectionRef.current.querySelectorAll('.cc-left-anim');
    gsap.fromTo(
      leftEls,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
      }
    );

    // Right diagram animation
    const rightEl = sectionRef.current.querySelector('.cc-right-anim');
    if (rightEl) {
      gsap.fromTo(
        rightEl,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }
  }, []);

  return (
    <section
      id="cross-chain"
      ref={sectionRef}
      className="w-full"
      style={{ background: '#0A0A1A', padding: '140px 24px' }}
    >
      <div className="mx-auto flex flex-col lg:flex-row items-center gap-16" style={{ maxWidth: 1280 }}>
        {/* Left - Text */}
        <div className="w-full lg:w-[45%]">
          <p className="cc-left-anim font-mono-label text-[#FF6B35] mb-4">LIFI PROTOCOL</p>
          <h2 className="cc-left-anim font-display text-white" style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
            Pay With Anything
          </h2>
          <p className="cc-left-anim text-[#A0A0B0] mt-6" style={{ fontSize: 18, lineHeight: 1.7 }}>
            Consumers hold USDC on Arbitrum but the restaurant wants SOL. No problem. LI.FI routes the payment automatically — the user pays on their preferred chain, the merchant receives native liquidity on Solana.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="cc-left-anim flex gap-4 pb-6"
                style={{
                  borderBottom: i < features.length - 1 ? '1px solid rgba(76, 201, 240, 0.15)' : 'none',
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    width: 48,
                    height: 48,
                    background: 'rgba(76, 201, 240, 0.1)',
                    border: '1px solid rgba(76, 201, 240, 0.2)',
                  }}
                >
                  <feature.icon size={22} className="text-[#4CC9F0]" />
                </div>
                <div>
                  <h3 className="font-display text-white" style={{ fontSize: 24 }}>{feature.title}</h3>
                  <p className="text-[#A0A0B0] mt-1" style={{ fontSize: 16 }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Animated Flow Diagram */}
        <div className="cc-right-anim w-full lg:w-[55%] relative" style={{ minHeight: 450 }}>
          <svg viewBox="0 0 500 400" className="w-full h-full">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(76, 201, 240, 0.05)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="500" height="400" fill="url(#grid)" />

            {/* Left Node - User Wallet */}
            <g transform="translate(80, 200)">
              <circle r="40" fill="rgba(76, 201, 240, 0.1)" stroke="#4CC9F0" strokeWidth="1.5" />
              <text textAnchor="middle" y="-8" fill="#4CC9F0" fontSize="11" fontFamily="IBM Plex Mono" style={{ textTransform: 'uppercase' }}>User</text>
              <text textAnchor="middle" y="10" fill="white" fontSize="14" fontFamily="Space Grotesk">Wallet</text>
              {/* Token badge */}
              <g transform="translate(-25, -55)">
                <rect x="0" y="0" width="50" height="20" rx="10" fill="rgba(76, 201, 240, 0.2)" stroke="#4CC9F0" strokeWidth="0.5" />
                <text x="25" y="14" textAnchor="middle" fill="#4CC9F0" fontSize="9" fontFamily="IBM Plex Mono">USDC</text>
              </g>
            </g>

            {/* Right Node - Solana Contract */}
            <g transform="translate(420, 200)">
              <circle r="40" fill="rgba(46, 204, 113, 0.1)" stroke="#2ECC71" strokeWidth="1.5" />
              <text textAnchor="middle" y="-8" fill="#2ECC71" fontSize="11" fontFamily="IBM Plex Mono" style={{ textTransform: 'uppercase' }}>Solana</text>
              <text textAnchor="middle" y="10" fill="white" fontSize="14" fontFamily="Space Grotesk">Contract</text>
              <g transform="translate(-20, -55)">
                <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(46, 204, 113, 0.2)" stroke="#2ECC71" strokeWidth="0.5" />
                <text x="20" y="14" textAnchor="middle" fill="#2ECC71" fontSize="9" fontFamily="IBM Plex Mono">SOL</text>
              </g>
            </g>

            {/* Center Node - LI.FI Router */}
            <g transform="translate(250, 200)">
              <circle r="50" fill="rgba(255, 107, 53, 0.15)" stroke="#FF6B35" strokeWidth="2" filter="url(#glow)">
                <animate attributeName="r" values="48;52;48" dur="3s" repeatCount="indefinite" />
              </circle>
              <text textAnchor="middle" y="-5" fill="#FF6B35" fontSize="16" fontFamily="Space Grotesk" fontWeight="600">LI.FI</text>
              <text textAnchor="middle" y="12" fill="rgba(255, 107, 53, 0.7)" fontSize="9" fontFamily="IBM Plex Mono" style={{ textTransform: 'uppercase' }}>Router</text>
            </g>

            {/* Flow Lines */}
            {/* User to Router */}
            <path
              d="M 120 200 Q 185 200 200 200"
              fill="none"
              stroke="url(#flowGrad)"
              strokeWidth="2"
              strokeDasharray="6,4"
            >
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
            </path>

            {/* Router to Solana */}
            <path
              d="M 300 200 Q 315 200 380 200"
              fill="none"
              stroke="url(#flowGrad)"
              strokeWidth="2"
              strokeDasharray="6,4"
            >
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
            </path>

            {/* Orbiting tokens around router */}
            <g>
              <circle r="5" fill="#4CC9F0">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M 250 200 m -70 0 a 70 70 0 1 0 140 0 a 70 70 0 1 0 -140 0"
                />
              </circle>
            </g>
            <g>
              <circle r="5" fill="#FF6B35">
                <animateMotion
                  dur="4s"
                  begin="1.3s"
                  repeatCount="indefinite"
                  path="M 250 200 m -70 0 a 70 70 0 1 0 140 0 a 70 70 0 1 0 -140 0"
                />
              </circle>
            </g>
            <g>
              <circle r="5" fill="#2ECC71">
                <animateMotion
                  dur="4s"
                  begin="2.6s"
                  repeatCount="indefinite"
                  path="M 250 200 m -70 0 a 70 70 0 1 0 140 0 a 70 70 0 1 0 -140 0"
                />
              </circle>
            </g>

            {/* Labels */}
            <text x="250" y="340" textAnchor="middle" fill="#A0A0B0" fontSize="11" fontFamily="IBM Plex Mono" style={{ textTransform: 'uppercase' }}>
              Cross-Chain Settlement
            </text>
            <text x="250" y="360" textAnchor="middle" fill="rgba(160, 160, 176, 0.5)" fontSize="10" fontFamily="IBM Plex Mono">
              Automatic bridging + swap routing
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const chains = [
  { name: 'ETHEREUM', color: '#627EEA' },
  { name: 'SOLANA', color: '#14F195' },
  { name: 'ARBITRUM', color: '#28A0F0' },
  { name: 'POLYGON', color: '#8247E5' },
  { name: 'BASE', color: '#0052FF' },
  { name: 'AVALANCHE', color: '#E84142' },
  { name: 'OPTIMISM', color: '#FF0420' },
  { name: 'BNB CHAIN', color: '#F3BA2F' },
];

export default function CrossChainMarquee() {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bandRef.current) return;
    gsap.fromTo(
      bandRef.current,
      { opacity: 0 },
      {
        opacity: 1, duration: 0.6,
        scrollTrigger: { trigger: bandRef.current, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  }, []);

  const MarqueeContent = () => (
    <>
      {chains.map((chain, i) => (
        <span key={i} className="flex items-center gap-4 mx-8 whitespace-nowrap">
          <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: chain.color }} />
          <span className="font-mono-label text-[#A0A0B0]" style={{ fontSize: 14 }}>{chain.name}</span>
          <span className="text-[#FF6B35] font-display text-lg">×</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      ref={bandRef}
      className="w-full overflow-hidden flex items-center opacity-0"
      style={{
        height: 120,
        background: 'rgba(10, 10, 26, 0.6)',
      }}
    >
      <div className="flex animate-marquee">
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  );
}

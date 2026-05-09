import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { Menu, X, Wallet } from 'lucide-react';

const navLinks = [
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Voice List', href: '#voice' },
  { label: 'Cross-Chain', href: '#cross-chain' },
  { label: 'Robot', href: '#robot' },
  { label: 'Docs', href: '#footer' },
];

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 opacity-0"
      style={{ background: 'rgba(3, 4, 94, 0.85)', backdropFilter: 'blur(12px)', height: 72 }}
    >
      <div className="mx-auto flex items-center justify-between h-full px-6 lg:px-10" style={{ maxWidth: 1280 }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="font-display font-bold text-white" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>
            RESCUE
          </span>
          <span className="inline-block rounded-full bg-[#FF6B35]" style={{ width: 8, height: 8 }} />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono-label text-[#A0A0B0] hover:text-white transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <button className="flex items-center gap-2 border border-[#FF6B35] text-[#FF6B35] rounded-full px-6 py-2.5 font-mono-label hover:bg-[#FF6B35] hover:text-[#03045E] transition-all duration-300">
            <Wallet size={14} />
            Connect Wallet
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#03045E] border-t border-[rgba(255,255,255,0.1)] px-6 py-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono-label text-[#A0A0B0] hover:text-white transition-colors duration-300"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button className="flex items-center justify-center gap-2 border border-[#FF6B35] text-[#FF6B35] rounded-full px-6 py-2.5 font-mono-label hover:bg-[#FF6B35] hover:text-[#03045E] transition-all duration-300 mt-2">
              <Wallet size={14} />
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

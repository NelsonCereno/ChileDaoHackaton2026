import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { BookOpen, Compass, Menu, X } from 'lucide-react';
import { truncateAddress } from '@/lib/solana';

export function Navbar() {
  const { connected, publicKey } = useWallet();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/professor', label: 'Publish', icon: BookOpen },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0e0e0e]/90 backdrop-blur-md border-b border-[#262626]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl text-[#ffd900] tracking-tight hover:opacity-80 transition-opacity">
          EduMint
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`text-sm font-medium transition-all duration-200 hover:text-[#ffd900] ${
                isActive(path) ? 'text-[#ffd900]' : 'text-[#fbf5dc]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Wallet + Mobile Toggle */}
        <div className="flex items-center gap-4">
          {connected && publicKey && (
            <span className="hidden md:block font-mono-data text-xs text-[#ffd900]">
              {truncateAddress(publicKey.toString())}
            </span>
          )}
          <div className="hidden md:block">
            <WalletMultiButton
              style={{
                background: 'transparent',
                border: '1px solid #262626',
                borderRadius: '100px',
                color: '#fbf5dc',
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 20px',
                height: 'auto',
              }}
            />
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[#fbf5dc]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050505] border-t border-[#262626] px-6 py-6 space-y-4">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 text-base ${
                isActive(path) ? 'text-[#ffd900]' : 'text-[#fbf5dc]'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div className="pt-4">
            <WalletMultiButton
              style={{
                background: 'transparent',
                border: '1px solid #262626',
                borderRadius: '100px',
                color: '#fbf5dc',
                fontSize: '14px',
                fontWeight: 500,
                padding: '10px 24px',
                height: 'auto',
                width: '100%',
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

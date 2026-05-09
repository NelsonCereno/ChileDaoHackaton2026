import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface ElectricConduitButtonProps {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'gold' | 'outline';
  className?: string;
}

export function ElectricConduitButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'gold',
  className = '',
}: ElectricConduitButtonProps) {
  const [active, setActive] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled || loading) return;
    setActive(true);
    setTimeout(() => setActive(false), 600);
    await onClick();
  }, [onClick, disabled, loading]);

  // Split text into two halves for the conduit effect
  const childrenStr = typeof children === 'string' ? children : '';
  const mid = Math.ceil(childrenStr.length / 2);
  const leftText = childrenStr.slice(0, mid);
  const rightText = childrenStr.slice(mid);

  const baseClasses =
    variant === 'gold'
      ? 'grad-gold text-[#0e0e0e] font-semibold hover:shadow-[0_0_40px_rgba(255,217,0,0.4)]'
      : 'bg-transparent border border-[#262626] text-[#fbf5dc] hover:border-[#ffd900] hover:text-[#ffd900]';

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden px-8 py-4 text-base
        transition-all duration-600
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active ? 'scale-y-[0.85] scale-x-[1.15]' : 'scale-100'}
        ${baseClasses}
        ${className}
      `}
      style={{
        transitionTimingFunction: active
          ? 'cubic-bezier(0.76, 0, 0.24, 1)'
          : 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      {/* Glow layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          boxShadow: '0 0 60px rgba(255, 217, 0, 0.6)',
        }}
      />

      {/* Content */}
      {loading ? (
        <span className="flex items-center justify-center gap-2 relative z-10">
          <Loader2 size={18} className="animate-spin" />
          Processing...
        </span>
      ) : !childrenStr ? (
        <span className="relative z-10">{children}</span>
      ) : (
        <span
          className={`relative z-10 flex items-center justify-center whitespace-nowrap ${
            active ? 'gap-4' : 'gap-0'
          }`}
          style={{
            transition: 'gap 0.6s cubic-bezier(0.76, 0, 0.24, 1)',
          }}
        >
          <span
            className="inline-block transition-transform"
            style={{
              transform: active ? 'translateX(-30%)' : 'translateX(0)',
              transition: 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            {leftText}
          </span>

          {/* Lightning bolt */}
          <svg
            width="12"
            height="24"
            viewBox="0 0 12 24"
            fill="none"
            className="flex-shrink-0"
            style={{
              transform: active ? 'scaleY(1)' : 'scaleY(0)',
              transition: 'transform 0.3s ease-in-out',
              transformOrigin: 'center',
            }}
          >
            <path
              d="M7 0L0 13H5L3 24L12 9H7L7 0Z"
              fill={variant === 'gold' ? '#0e0e0e' : '#ffd900'}
            />
          </svg>

          <span
            className="inline-block transition-transform"
            style={{
              transform: active ? 'translateX(30%)' : 'translateX(0)',
              transition: 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            {rightText}
          </span>
        </span>
      )}
    </button>
  );
}

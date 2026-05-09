import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { MonolithicAvatar } from './MonolithicAvatar';
import { truncateAddress, lamportsToSOL } from '@/lib/solana';
import type { AcademicWork } from '@/lib/solana';

interface WorkCardProps {
  work: AcademicWork;
}

export function WorkCard({ work }: WorkCardProps) {
  const solPrice = lamportsToSOL(work.priceLamports);

  return (
    <Link
      to={`/work/${work.workId}`}
      className="group block bg-[#050505] border border-[#262626] hover:border-[#ffd900]/60 transition-all duration-300"
    >
      {/* Avatar */}
      <div className="w-full h-48 bg-[#0e0e0e] flex items-center justify-center overflow-hidden relative">
        <div className="group-hover:scale-105 transition-transform duration-500">
          <MonolithicAvatar hash={work.contentHash} size={140} />
        </div>
        <div className="absolute inset-0 bg-[#ffd900]/0 group-hover:bg-[#ffd900]/5 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-display text-xl text-[#fbf5dc] leading-tight group-hover:text-[#ffd900] transition-colors line-clamp-2">
          {work.title}
        </h3>

        <p className="font-mono-data text-xs text-[#ffd900]">
          {truncateAddress(work.professor)}
        </p>

        <p className="text-sm text-[#8a8a8a] line-clamp-2 leading-relaxed">
          {work.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
          <span className="font-display text-lg text-[#fbf5dc]">{solPrice} SOL</span>
          <div className="flex items-center gap-1.5 text-[#8a8a8a]">
            <Eye size={14} />
            <span className="text-xs">{work.accessCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

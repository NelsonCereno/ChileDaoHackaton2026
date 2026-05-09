import { useState, useEffect, useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { WorkCard } from '@/components/WorkCard';
import { getAllWorks } from '@/lib/solana';
import type { AcademicWork } from '@/lib/solana';

export function Explore() {
  const { connection } = useConnection();
  const [works, setWorks] = useState<AcademicWork[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'popular'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAllWorks(connection);
      setWorks(data);
      setLoading(false);
    }
    load();
  }, [connection]);

  const filteredWorks = useMemo(() => {
    let result = [...works];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.professor.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceLamports - b.priceLamports);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceLamports - a.priceLamports);
        break;
      case 'popular':
        result.sort((a, b) => b.accessCount - a.accessCount);
        break;
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [works, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] pt-24 pb-16 px-6">
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-[#fbf5dc]">
            The <span className="text-[#ffd900]">Archive</span>
          </h1>
          <p className="text-[#8a8a8a] max-w-lg">
            Browse verified academic works registered on-chain. Each entry carries cryptographic proof of authenticity.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-20 z-30 bg-[#0e0e0e]/90 backdrop-blur-md border-b border-[#262626] py-4 -mx-6 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#404040]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search works, professors, topics..."
                className="w-full bg-[#262626] border border-[#404040] pl-11 pr-4 py-3 text-[#fbf5dc] placeholder-[#404040] focus:border-[#ffd900] focus:outline-none transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#404040]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#262626] border border-[#404040] pl-11 pr-8 py-3 text-[#fbf5dc] focus:border-[#ffd900] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Accessed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
          <span>{filteredWorks.length} works found</span>
          <span className="text-[#262626]">|</span>
          <span>{works.reduce((sum, w) => sum + w.accessCount, 0)} total accesses</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#050505] border border-[#262626] h-[380px] animate-pulse" />
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="bg-[#050505] border border-[#262626] py-24 text-center">
            <BookOpen className="mx-auto text-[#404040] mb-4" size={40} />
            <p className="text-[#8a8a8a] text-lg">No works found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <WorkCard key={work.workId} work={work} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

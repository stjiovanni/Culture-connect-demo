"use client";

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, type Product } from '@/lib/data';
import { useVotes } from '@/context/VoteContext';
import { useWebHaptics } from 'web-haptics/react';

import CategoryStack from '@/components/CategoryStack';

/* ─────────────────────────────────────────────
   VOTES PAGE
   ───────────────────────────────────────────── */
export default function VotesPage() {
  const haptic = useWebHaptics();
  const allProducts = getProducts();
  const { votes } = useVotes();
  const [activeTab, setActiveTab] = useState('all');

  const votedItems = useMemo(() => {
    return allProducts.filter(p => votes.some(v => v.productId === p.id));
  }, [allProducts, votes]);

  // Group by category
  const categorizedVotes = useMemo(() => {
    const map = new Map<string, Product[]>();
    const items = activeTab === 'all' 
      ? votedItems 
      : votedItems.filter(p => p.type === activeTab.slice(0, -1));
    
    items.forEach(p => {
      const existing = map.get(p.category) || [];
      existing.push(p);
      map.set(p.category, existing);
    });
    return Array.from(map.entries());
  }, [votedItems, activeTab]);

  return (
    <div className="flex flex-col min-h-screen font-sans pb-20">
      {/* Hero Section */}
      <div className="flex flex-col gap-10 pt-16 mb-16">
        <h1 className="text-7xl font-bold text-white tracking-tighter leading-none [text-wrap:balance]">
          {["Your", "Votes"].map((word, i) => (
            <span 
              key={i} 
              className="inline-block animate-in fade-in slide-in-from-bottom-2"
              style={{ 
                animationDuration: '700ms',
                animationDelay: `${i * 70}ms`,
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'both'
              }}
            >
              {word}{i < 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h1>

        {/* Filter Toggle */}
        <div className="flex justify-start">
          <div className="bg-[#161412]/85 backdrop-blur-xl border border-white/[0.08] p-1 rounded-full flex items-center">
            {['all', 'products', 'services'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); haptic.trigger('selection'); }}
                className={`px-8 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-black shadow-xl' 
                  : 'text-[#9E9B96] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category-Grouped Stacked Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        {categorizedVotes.map(([category, items], i) => (
          <div key={category} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 animation-delay-${i * 100}`}>
            <CategoryStack category={category} items={items} haptic={haptic} />
          </div>
        ))}
      </div>

      {categorizedVotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
          <p className="text-white text-lg font-bold tracking-tight">No items found in this category.</p>
          <button 
            onClick={() => setActiveTab('all')}
            className="text-[11px] font-bold text-[#6E5B98] hover:underline"
          >
            View all votes
          </button>
        </div>
      )}
    </div>
  );
}

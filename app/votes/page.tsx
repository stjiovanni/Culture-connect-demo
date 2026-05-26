"use client";

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, type Product } from '@/lib/data';
import { useVotes } from '@/context/VoteContext';
import { useWebHaptics } from 'web-haptics/react';

import CategoryStack from '@/components/CategoryStack';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col min-h-screen font-sans max-w-[1400px] mx-auto px-6 pt-6 pb-20">
      {/* Hero Section */}
      <div className="flex flex-col gap-10 pt-16 mb-16">
        <h1 className="heading font-bold text-white tracking-tighter [text-wrap:balance]">
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
          <div className="bg-[#161412]/85 backdrop-blur-xl border border-white/[0.08] p-1 rounded-full flex items-center relative">
            {['all', 'products', 'services'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); haptic.trigger('selection'); }}
                className={`btn-text relative px-8 py-2.5 rounded-full font-bold transition-all z-10 pressable ${
                   activeTab === tab 
                   ? 'text-black' 
                   : 'text-[#9E9B96] hover:text-white'
                 }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="votesTabIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-xl z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
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
          <p className="body-text text-white">No items found in this category.</p>
          <button 
            onClick={() => setActiveTab('all')}
            className="btn-text font-bold text-[#6E5B98] hover:underline"
          >
            View all votes
          </button>
        </div>
      )}
    </div>
  );
}

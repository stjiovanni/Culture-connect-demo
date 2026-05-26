"use client";

import { useEffect, useRef } from 'react';
import { getCategories, getAreas } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon } from '@hugeicons/core-free-icons';
import { useFilter } from '../context/FilterContext';
import { motion } from 'framer-motion';

interface FilterDrawerProps {
  isOpen: boolean;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceMin: number;
  setPriceMin: (val: number) => void;
  priceMax: number;
  setPriceMax: (val: number) => void;
  selectedAreas: (number | '')[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<(number | '')[]>>;
  onApply: () => void;
  onClear: () => void;
}

export default function FilterDrawer({
  isOpen, selectedCategories, setSelectedCategories,
  priceMin, setPriceMin, priceMax, setPriceMax,
  selectedAreas, setSelectedAreas,
  onApply, onClear
}: FilterDrawerProps) {
  const categories = getCategories();
  const areas = getAreas();
  const haptic = useWebHaptics();
  const { toggleDrawer } = useFilter();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleDrawer();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleDrawer]);

  if (!isOpen) return null;

  const handleCategoryToggle = (c: string) => {
    setSelectedCategories(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
    haptic.trigger('selection');
  };

  const handleAreaToggle = (area: number | '') => {
    if (area === '') {
      setSelectedAreas(['']);
    } else {
      setSelectedAreas(prev => {
        const withoutGlobal = prev.filter(a => a !== '');
        if (withoutGlobal.includes(area)) {
          const next = withoutGlobal.filter(a => a !== area);
          return next.length === 0 ? [''] : next;
        } else {
          return [...withoutGlobal, area];
        }
      });
    }
    haptic.trigger('selection');
  };

  return (
    <>
      {/* Transparent backdrop */}
      <div 
        className="fixed inset-0 z-30 bg-transparent" 
        onClick={() => {
          toggleDrawer();
          haptic.trigger('light');
        }}
        aria-hidden="true"
      />
      
      <div
        ref={drawerRef}
        className={`fixed top-[70px] left-0 right-0 z-40 w-full transition-all duration-500 ease-[var(--ease-drawer)] origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'} advanced-filter-glass rounded-[24px] p-8 shadow-2xl border border-white/5 font-sans tracking-[-0.5px]`}
      >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Categories */}
        <div>
          <h3 className="text-[13px] text-[#86847F] mb-6 font-bold">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => handleCategoryToggle(c)}
                className={`relative px-4 py-2 text-[11px] font-bold transition-colors rounded-full pressable overflow-hidden ${selectedCategories.includes(c)
                  ? 'text-black'
                  : 'liquid-glass text-[#9E9B96] hover:text-white'
                  }`}
              >
                {selectedCategories.includes(c) && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-[13px] text-[#86847F] mb-6 font-bold flex items-center">
            Price Range: <span className="text-white font-bold ml-2 tabular-nums">£{priceMin} – £{priceMax}</span>
          </h3>
          <div className="relative h-10 mb-8 px-2">
            <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[4px] bg-white/10 rounded-full" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[4px] bg-[#6E5B98] rounded-full price-track-active"
              style={{
                '--track-left': `${(priceMin / 2000) * 100}%`,
                '--track-right': `${100 - (priceMax / 2000) * 100}%`
              } as React.CSSProperties}
            />
            <input
              type="range" min="0" max="2000" step="25" value={priceMin}
              title="Minimum Price"
              aria-label="Minimum Price"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v < priceMax) setPriceMin(v);
              }}
              onInput={() => haptic.trigger('selection')}
              className="price-slider"
            />
            <input
              type="range" min="0" max="2000" step="25" value={priceMax}
              title="Maximum Price"
              aria-label="Maximum Price"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v > priceMin) setPriceMax(v);
              }}
              onInput={() => haptic.trigger('selection')}
              className="price-slider"
            />
          </div>
          
          <div className="flex gap-2 justify-center mb-4">
            <button 
              onClick={() => { setPriceMin(75); setPriceMax(2000); haptic.trigger('selection'); }}
              className="liquid-glass rounded-full px-4 py-2 text-[11px] font-bold text-[#9E9B96] hover:text-white transition-all pressable"
            >Over £75</button>
            <button 
              onClick={() => { setPriceMin(0); setPriceMax(200); haptic.trigger('selection'); }}
              className="liquid-glass rounded-full px-4 py-2 text-[11px] font-bold text-[#9E9B96] hover:text-white transition-all pressable"
            >Under £200</button>
            <button 
              onClick={() => { setPriceMin(0); setPriceMax(2000); haptic.trigger('selection'); }}
              className="liquid-glass rounded-full px-4 py-2 text-[11px] font-bold text-[#9E9B96] hover:text-white transition-all pressable"
            >Any</button>
          </div>
          <p className="text-[10px] text-[#86847F] font-medium text-center">Adjust the sliders to set your budget</p>
        </div>

        {/* Local Scope */}
        <div>
          <h3 className="text-[13px] text-[#86847F] mb-6 font-bold">Local Scope</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAreaToggle('')}
              className={`relative px-4 py-2 text-[11px] font-bold transition-colors rounded-full pressable overflow-hidden ${selectedAreas.includes('')
                ? 'text-white'
                : 'liquid-glass text-[#9E9B96] hover:text-white'
                }`}
            >
              {selectedAreas.includes('') && (
                 <motion.div
                   className="absolute inset-0 liquid-glass-strong-purple"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 />
              )}
              <span className="relative z-10">Global</span>
            </button>
            {areas.map(a => (
              <button
                key={a.id}
                onClick={() => handleAreaToggle(a.id)}
                className={`relative px-4 py-2 text-[11px] font-bold transition-colors rounded-full pressable overflow-hidden ${selectedAreas.includes(a.id)
                  ? 'text-black'
                  : 'liquid-glass text-[#9E9B96] hover:text-white'
                  }`}
              >
                {selectedAreas.includes(a.id) && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
        <button
          onClick={() => {
            onClear();
            haptic.trigger('warning');
          }}
          className="btn-text liquid-glass-red text-[#FF7575] px-6 py-2.5 rounded-full font-bold transition-all pressable"
        >
          Clear filters
        </button>
        <button
          onClick={() => {
            onApply();
            toggleDrawer();
            haptic.trigger('success');
          }}
          className="btn-text liquid-glass-strong-purple text-white px-8 py-2.5 rounded-full font-bold transition-all pressable"
        >
          Apply filters
        </button>
      </div>
    </div>
    </>
  );
}

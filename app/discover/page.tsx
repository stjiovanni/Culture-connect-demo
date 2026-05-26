"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getAreas, type Product } from '@/lib/data';
import { useViewMode } from '@/context/ViewModeContext';
import { useFilter } from '@/context/FilterContext';
import FilterDrawer from '@/components/FilterDrawer';
import MobileHeaderTabs from '@/components/MobileHeaderTabs';
import { useWebHaptics } from 'web-haptics/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import Pill from '@/components/Pill';

export default function DiscoverPage() {
  const { viewMode } = useViewMode();
  const { 
    isDrawerOpen, typeFilter, searchQuery,
    selectedCategories, setSelectedCategories,
    selectedAreas, setSelectedAreas,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    clearAllFilters,
    appliedCategories,
    appliedAreas,
    appliedPriceMin,
    appliedPriceMax,
    isAdvancedFilterActive,
    setAppliedCategories,
    setAppliedAreas,
    setAppliedPriceMin,
    setAppliedPriceMax,
  } = useFilter();
  const allProducts = getProducts();
  const haptic = useWebHaptics();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    const t = setTimeout(() => setMounted(true), 0); 
    return () => clearTimeout(t); 
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.company_name.toLowerCase().includes(q) ||
        p.area_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.price.toString().includes(q)
      );
    }

    if (appliedCategories.length > 0) {
      result = result.filter(p => appliedCategories.includes(p.category));
    }
    
    if (appliedAreas.length > 0 && !appliedAreas.includes('')) {
      result = result.filter(p => appliedAreas.includes(p.area_id));
    }
    
    result = result.filter(p => p.price >= appliedPriceMin && p.price <= appliedPriceMax);

    return result;
  }, [allProducts, typeFilter, searchQuery, appliedCategories, appliedAreas, appliedPriceMin, appliedPriceMax]);

  const sectionContent = useMemo(() => {
    switch (typeFilter) {
      case 'product':
        return {
          title: 'Products',
          copy: 'Browse items created and shared by makers and artisans across different cultural categories.'
        };
      case 'service':
        return {
          title: 'Services',
          copy: 'Find specialised skills and experiences offered by professionals and community members.'
        };
      default:
        return {
          title: 'Discover',
          copy: 'Explore the complete collection of products and services showcased by creators in the community.'
        };
    }
  }, [typeFilter]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto px-6 pt-6 pb-6">
      {viewMode === 'admin' && (
        <div className="glass-pill rounded-full px-6 py-3 text-[11px] text-center border border-[#6E5B98]/30 text-[#DDD6F3] font-bold tracking-[-0.5px] animate-in fade-in slide-in-from-top-2 duration-500">
          <span className="opacity-60 mr-2">Mode:</span> Administrative Access — Read Only
        </div>
      )}

      {/* Mobile Header Tabs */}
      <MobileHeaderTabs />

      {/* Section Header */}
      <div className="mt-[-12px] md:mt-4 text-left max-w-lg animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="heading font-serif text-white tracking-tight">
          {sectionContent.title}
        </h1>
        <p className="body-text text-[#86847F]">
          {sectionContent.copy}
        </p>
        <span className="text-[11px] font-bold text-[#86847F]/80">{filteredProducts.length} results</span>
      </div>

      {/* Product Grid — Desktop: standard grid, Mobile: Pinterest masonry */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((p, i) => (
          <ProductCard key={p.id} p={p} i={i} haptic={haptic} />
        ))}
      </div>

      {/* Mobile masonry grid */}
      <div className="md:hidden masonry-grid">
        {filteredProducts.map((p, i) => (
          <MobileProductCard key={p.id} p={p} i={i} haptic={haptic} />
        ))}
      </div>

      {/* Selected Filters Bar - Bottom */}
      {isAdvancedFilterActive && (
        <div className="fixed bottom-[84px] md:bottom-10 left-6 right-6 z-30 flex flex-wrap gap-2 pt-4 pb-0 justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
          {appliedCategories.map(cat => (
            <div key={cat} className="glass-pill px-4 py-2 rounded-full text-[11px] font-bold text-white flex items-center gap-2 border border-white/10 backdrop-blur-md pointer-events-auto">
              {cat}
              <button
                onClick={() => {
                  setSelectedCategories((prev: string[]) => prev.filter(c => c !== cat));
                  setAppliedCategories((prev: string[]) => prev.filter(c => c !== cat));
                  haptic.trigger('light');
                }}
                className="hover:text-[#FF7575] transition-colors"
                aria-label={`Remove ${cat} filter`}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </div>
          ))}
          
          {(appliedAreas.length > 0 && !appliedAreas.includes('')) && appliedAreas.map(areaId => {
            const area = getAreas().find(a => a.id === areaId);
            if (!area) return null;
            return (
              <div key={areaId} className="glass-pill px-4 py-2 rounded-full text-[11px] font-bold text-white flex items-center gap-2 border border-white/10 backdrop-blur-md pointer-events-auto">
                {area.name}
                <button
                  onClick={() => {
                    setSelectedAreas((prev: (number | '')[]) => prev.filter(a => a !== areaId));
                    setAppliedAreas((prev: (number | '')[]) => prev.filter(a => a !== areaId));
                    haptic.trigger('light');
                  }}
                  className="hover:text-[#FF7575] transition-colors"
                  aria-label={`Remove ${area.name} filter`}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={12} />
                </button>
              </div>
            );
          })}

          {(appliedPriceMin !== 0 || appliedPriceMax !== 2000) && (
            <div className="glass-pill px-4 py-2 rounded-full text-[11px] font-bold text-white flex items-center gap-2 border border-white/10 backdrop-blur-md pointer-events-auto">
              £{appliedPriceMin} - £{appliedPriceMax}
              <button
                onClick={() => {
                  setPriceMin(0);
                  setPriceMax(2000);
                  setAppliedPriceMin(0);
                  setAppliedPriceMax(2000);
                  haptic.trigger('light');
                }}
                className="hover:text-[#FF7575] transition-colors"
                aria-label="Remove price filter"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(12px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Desktop Product Card
   ───────────────────────────────────────────── */
function ProductCard({ p, i, haptic }: { p: Product, i: number, haptic: ReturnType<typeof useWebHaptics> }) {
  return (
    <Link
      href={`/product/${p.id}`}
      onClick={() => haptic.trigger('light')}
      className="group relative rounded-[24px] shadow-[#6E5B98]/10 pressable rainbow-border aspect-[1000/1414] animate-fadeInUp"
      style={{ 
        animationDelay: `${i * 0.05}s`,
      }}
    >
      {/* Background Image & Content Wrapper */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-[24px]">
        <Image 
          src={`/uploads/${p.image_filename}`} 
          alt={p.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" 
          priority={i < 4}
        />
        {/* Permanent bottom-heavy gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/4 to-black/82"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <Pill className="text-[11px] font-semibold border-white/10 bg-black/20 text-[#DDD6F3] backdrop-blur-md px-3 py-1">{p.category}</Pill>
          </div>
          
          <h3 className="text-xl font-bold text-white leading-tight mt-1 line-clamp-2">
            {p.name}
          </h3>
        </div>

        <div className="mt-auto">
          <p className="text-base font-bold text-white leading-none">{p.company_name}</p>
          <p className="text-[11px] font-bold text-[#86847F] mt-1 opacity-80">
            @{p.company_name.toLowerCase().replace(/\s+/g, '').replace(/&/g, '')}
          </p>
          <p className="absolute bottom-5 right-5 text-xl font-bold text-white">£{p.price.toFixed(0)}</p>
        </div>
      </div>

      {/* Hover Reveal Overlay */}
      <div 
        className="absolute inset-0 z-20 bg-black/40 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-all duration-[0.35s] rounded-[24px] overflow-hidden backdrop-blur-[18px]"
      >
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-[0.35s]">
          <p className="body-text text-white/90 mb-6 line-clamp-4">{p.description}</p>
          <div className="flex items-center gap-[4px]">
            <HugeiconsIcon icon={Location01Icon} size={16} className="text-[#6E5B98]" />
            <p className="text-[12px] font-bold text-white">{p.area_name}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rainbow-border {
          isolation: isolate;
        }

        .rainbow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          z-index: -1;
          background: conic-gradient(
            from 0deg,
            #6E5B98,
            #FF7575,
            #DDD6F3,
            #6E5B98
          );
          border-radius: inherit;
          animation: rotateRainbow 6s linear infinite;
          opacity: 0.5;
          filter: blur(0.5px);
        }

        @keyframes rotateRainbow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Mobile Product Card (Pinterest / Staggered)
   ───────────────────────────────────────────── */
function MobileProductCard({ p, i, haptic }: { p: Product, i: number, haptic: ReturnType<typeof useWebHaptics> }) {
  // Staggered heights for Pinterest effect
  const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[5/6]'];
  const aspectClass = heights[i % heights.length];

  return (
    <Link
      href={`/product/${p.id}`}
      onClick={() => haptic.trigger('light')}
      className={`group relative rounded-[20px] overflow-hidden pressable ${aspectClass} block animate-fadeInUp`}
      style={{ animationDelay: `${i * 0.04}s` }}
    >
      <Image 
        src={`/uploads/${p.image_filename}`} 
        alt={p.name} 
        fill 
        className="object-cover" 
        priority={i < 4}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-[10px] font-bold text-[#DDD6F3] opacity-80 mb-0.5">{p.category}</p>
        <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-2">{p.name}</h3>
        <p className="text-[11px] font-bold text-white mt-1">£{p.price.toFixed(0)}</p>
      </div>
    </Link>
  );
}

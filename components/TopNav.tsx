"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterHorizontalIcon, LogoutSquare01Icon, Cancel01Icon, CancelCircleIcon } from '@hugeicons/core-free-icons';
import { useFilter } from '../context/FilterContext';
import { useWebHaptics } from 'web-haptics/react';
import { useViewMode } from '@/context/ViewModeContext';
import { useVotes } from '@/context/VoteContext';
import FilterDrawer from './FilterDrawer';
import { motion } from 'framer-motion';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Products', value: 'product' },
  { label: 'Services', value: 'service' },
] as const;

export default function TopNav() {
  const {
    isDrawerOpen,
    toggleDrawer,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    isAdvancedFilterActive,
    clearAllFilters,
    selectedCategories,
    setSelectedCategories,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    selectedAreas,
    setSelectedAreas,
    applyFilters,
  } = useFilter();
  const { viewMode } = useViewMode();
  const { voteCount } = useVotes();
  const haptic = useWebHaptics();
  const pathname = usePathname();
  const router = useRouter();
  const [navAvatar, setNavAvatar] = useState('/uploads/avatar_7_1776873674.jpeg');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatar) setNavAvatar(parsed.avatar);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const saved = sessionStorage.getItem('user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.avatar) setNavAvatar(parsed.avatar);
        }
      } catch {}
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  const handleTabClick = (value: string) => {
    setTypeFilter(value);
    haptic.trigger('selection');
    if (pathname !== '/discover') {
      router.push('/discover');
    }
  };

  const handleApply = () => {
    applyFilters();
    haptic.trigger('success');
    if (pathname !== '/discover') {
      router.push('/discover');
    }
  };

  const handleClear = () => {
    clearAllFilters();
    haptic.trigger('warning');
  };

  if (pathname === '/' || pathname === '/landing') return null;

  return (
    <header id="site-header" className="font-sans sticky top-0 z-50 border-b border-white/[0.03] relative">
      <nav className="flex justify-center w-full px-4 py-3">
        <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 max-w-[1400px] w-full">

          {/* Logo Pill — its own separate glass pill */}
          <div className="glass-pill flex items-center justify-center h-[46px] w-14 rounded-full shrink-0">
            <Link
              href="/discover"
              className="flex items-center justify-center pressable"
              onClick={() => haptic.trigger('light')}
              data-cuelume-hover="tick"
              aria-label="Culture Connect home"
            >
              <div className="relative w-[28px] h-[28px] flex items-center justify-center">
                <Image
                  src="/culture-connect.svg"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Left Pill: Tabs + Admin */}
          <div className="glass-pill flex items-center h-[46px] pl-[7px] pr-[7px] shrink-0 min-w-max rounded-full">
            <div className="flex items-center gap-2 ml-1">
              {TABS.map((tab) => {
                const isActive = typeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    data-cuelume-press
                    data-cuelume-hover="tick"
                    className={`relative px-3 py-1.5 text-[13px] tracking-[-0.03em] transition-colors rounded-full pressable ${isActive
                      ? 'text-black font-semibold'
                      : 'text-[#9E9B96] font-normal hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-white rounded-full shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 520, damping: 38 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}

              {viewMode === 'admin' && (
                <>
                  <Link
                    href="/admin/manage"
                    className="px-3 py-1.5 text-[13px] font-normal tracking-[-0.03em] text-[#9E9B96] hover:text-white transition-all rounded-full pressable"
                    onClick={() => haptic.trigger('selection')}
                    data-cuelume-hover="tick"
                  >
                    Manage
                  </Link>
                  <Link
                    href="/admin/reports"
                    className="px-3 py-1.5 text-[13px] font-normal tracking-[-0.03em] text-[#9E9B96] hover:text-white transition-all rounded-full pressable"
                    onClick={() => haptic.trigger('selection')}
                    data-cuelume-hover="tick"
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Center Pill: Search (Expanding) */}
          <div className="glass-pill min-w-0 w-full flex items-center gap-2 pl-[11px] pr-[6px] h-[46px] rounded-full relative will-change-transform">
            <HugeiconsIcon icon={Search01Icon} size={16} className="text-[#86847F] shrink-0 ml-1" />
            <div className="flex-1 min-w-0 flex items-center relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white text-[15px] outline-none w-full min-w-0 placeholder-[#86847F] font-normal tracking-[-0.03em]"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); haptic.trigger('light'); }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Clear search"
                  data-cuelume-press
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-[#86847F]" />
                </button>
              )}
            </div>

            {isAdvancedFilterActive && (
              <button
                onClick={() => {
                  clearAllFilters();
                  haptic.trigger('warning');
                }}
                className="px-3 py-1.5 rounded-full bg-[#FF7575]/10 text-[#FF7575] text-[11px] font-normal tracking-[-0.03em] hover:bg-[#FF7575]/20 transition-all shrink-0 pressable flex items-center gap-1"
                data-cuelume-press
              >
                <HugeiconsIcon icon={CancelCircleIcon} size={12} />
                Clear filters
              </button>
            )}

            <button
              onClick={() => { toggleDrawer(); haptic.trigger('selection'); }}
              data-cuelume-press
              data-cuelume-hover="tick"
              className={`p-2 rounded-full transition-all shrink-0 pressable ${isDrawerOpen
                ? 'bg-[#6E5B98] text-white'
                : 'text-[#86847F] hover:text-white hover:bg-white/5'
                }`}
              aria-label="Toggle filter drawer"
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={18} />
            </button>
          </div>

          {/* Right Pill: User Actions */}
          <div className="glass-pill flex items-center gap-2 px-[10px] h-[46px] shrink-0 min-w-max rounded-full">
            <Link
              href="/profile"
              className={`w-8 h-8 rounded-full overflow-hidden border pressable cursor-pointer transition-colors ${pathname === '/profile' ? 'border-[#6E5B98]' : 'border-white/20'}`}
              onClick={() => haptic.trigger('light')}
              data-cuelume-hover="tick"
            >
              <Image
                src={navAvatar}
                alt="Profile"
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </Link>

            <button
              className="text-[#86847F] hover:text-[#FF7575] transition-all p-1 pressable hover:scale-110 ml-1"
              onClick={() => {
                haptic.trigger('warning');
                router.push('/landing');
              }}
              data-cuelume-press
              aria-label="Log out"
            >
              <HugeiconsIcon icon={LogoutSquare01Icon} size={20} />
            </button>
          </div>

        </div>
      </nav>

      {/* Global Advanced Filter Drawer */}
      <div className="relative max-w-[1400px] mx-auto w-full px-6">
        <FilterDrawer
          isOpen={isDrawerOpen}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          selectedAreas={selectedAreas}
          setSelectedAreas={setSelectedAreas}
          onApply={handleApply}
          onClear={handleClear}
        />
      </div>
    </header>
  );
}
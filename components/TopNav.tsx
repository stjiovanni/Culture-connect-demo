"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, FilterHorizontalIcon, LogoutSquare01Icon, Cancel01Icon, CancelCircleIcon } from '@hugeicons/core-free-icons';
import { useFilter } from '../context/FilterContext';
import { useWebHaptics } from 'web-haptics/react';
import { useViewMode } from '@/context/ViewModeContext';
import { useVotes } from '@/context/VoteContext';

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
    clearAllFilters
  } = useFilter();
  const { viewMode } = useViewMode();
  const { voteCount } = useVotes();
  const haptic = useWebHaptics();
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (value: string) => {
    setTypeFilter(value);
    haptic.trigger('selection');
    if (pathname !== '/discover') {
      router.push('/discover');
    }
  };

  return (
    <header id="site-header" className="font-sans sticky top-0 z-50 border-b border-white/[0.03] relative">
      <nav className="flex justify-center w-full px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 max-w-[1400px] w-full">

          {/* Left Pill: Logo & Navigation */}
          <div className="glass-pill flex items-center gap-2 px-6 h-[46px] shrink-0 min-w-max rounded-full">
            <Link
              href="/discover"
              className="flex items-center gap-2 pressable"
              onClick={() => haptic.trigger('light')}
            >
              <Image
                src="/culture-connect.svg"
                alt="Logo"
                width={80}
                height={20}
                className="h-5 w-auto"
                style={{ width: 'auto' }}
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabClick(tab.value)}
                  className={`px-3 py-1.5 text-[13px] font-bold transition-all rounded-full pressable ${typeFilter === tab.value
                      ? 'text-white'
                      : 'text-[#9E9B96] hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}

              {viewMode === 'admin' && (
                <>
                  <Link 
                    href="/admin/manage" 
                    className="px-3 py-1.5 text-[13px] font-bold text-[#9E9B96] hover:text-white transition-all rounded-full pressable"
                    onClick={() => haptic.trigger('selection')}
                  >
                    Manage
                  </Link>
                  <Link 
                    href="/admin/reports" 
                    className="px-3 py-1.5 text-[13px] font-bold text-[#9E9B96] hover:text-white transition-all rounded-full pressable"
                    onClick={() => haptic.trigger('selection')}
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Center Pill: Search (Expanding) */}
          <div className="glass-pill min-w-0 w-full flex items-center gap-2 px-4 h-[46px] rounded-full relative will-change-transform">
            <HugeiconsIcon icon={Search01Icon} size={16} className="text-[#86847F] shrink-0" />
            <div className="flex-1 min-w-0 flex items-center relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white text-[15px] outline-none w-full min-w-0 placeholder-[#86847F] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); haptic.trigger('light'); }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Clear search"
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
                className="px-3 py-1.5 rounded-full bg-[#FF7575]/10 text-[#FF7575] text-[11px] font-bold hover:bg-[#FF7575]/20 transition-all shrink-0 pressable flex items-center gap-1"
              >
                <HugeiconsIcon icon={CancelCircleIcon} size={12} />
                Clear filters
              </button>
            )}

            <button
              onClick={() => { toggleDrawer(); haptic.trigger('selection'); }}
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
          <div className="glass-pill flex items-center gap-2 px-4 h-[46px] shrink-0 min-w-max rounded-full">
            <Link
              href="/votes"
              className={`flex items-center gap-2 pressable cursor-pointer px-1 group ${pathname === '/votes' ? 'text-white' : ''}`}
              onClick={() => haptic.trigger('light')}
            >
              <span className={`text-[11px] font-bold ${pathname === '/votes' ? 'text-white' : 'text-[#9E9B96] group-hover:text-white transition-colors'}`}>Votes</span>
              <span className="bg-[#6E5B98] text-white text-[12px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-white/5 shadow-inner tabular-nums">
                {voteCount}
              </span>
            </Link>

            <div className="w-px h-6 bg-white/10" />

            <Link
              href="/profile"
              className="w-8 h-8 rounded-full overflow-hidden border border-white/20 pressable cursor-pointer ml-[2px]"
              onClick={() => haptic.trigger('light')}
            >
              <Image
                src="/uploads/avatar_7_1776873674.jpeg"
                alt="Profile"
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </Link>

            <button
              className="text-[#86847F] hover:text-[#FF7575] transition-all p-1 pressable hover:scale-110"
              onClick={() => haptic.trigger('warning')}
              aria-label="Log out"
            >
              <HugeiconsIcon icon={LogoutSquare01Icon} size={20} />
            </button>
          </div>

        </div>
      </nav>
    </header>
  );
}
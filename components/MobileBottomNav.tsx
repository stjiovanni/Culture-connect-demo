"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useWebHaptics } from 'web-haptics/react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const haptic = useWebHaptics();

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Prevent animation on first render
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

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

  const openSearch = useCallback(() => {
    haptic.trigger('light');
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 320);
  }, [haptic]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    // Clear + blur after close animation finishes (280ms)
    setTimeout(() => {
      setSearchValue('');
      inputRef.current?.blur();
    }, 280);
  }, []);

  const handleClearAndClose = useCallback(() => {
    haptic.trigger('light');
    closeSearch();
  }, [haptic, closeSearch]);

  // Backdrop tap dismisses
  const handleBackdropTap = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeSearch();
  }, [closeSearch]);

  return (
    <div className="mobile-nav-container">
      {/* Invisible backdrop overlay — intercepts taps to dismiss */}
      {isOpen && (
        <div
          className="mobile-search-backdrop"
          onClick={handleBackdropTap}
          aria-hidden="true"
        />
      )}

      {/* Search bar — always in DOM, toggled via CSS class */}
      <div
        ref={searchBarRef}
        className={`mobile-search-bar ${isOpen ? 'mobile-search-bar--open' : ''} ${!mounted ? 'mobile-search-bar--no-transition' : ''}`}
      >
        <div className="mobile-search-bar-inner">
          <HugeiconsIcon icon={Search01Icon} size={18} className="text-[#86847F] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search…"
            title="Search"
            className="mobile-search-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                router.push(`/discover?search=${encodeURIComponent(searchValue)}`);
                closeSearch();
              }
            }}
          />
          {searchValue.length > 0 && (
            <button
              onClick={handleClearAndClose}
              className="mobile-search-clear"
              aria-label="Clear search"
              type="button"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Nav pill */}
      <nav className="mobile-bottom-pill" aria-label="Mobile navigation">
        <Link
          href="/discover"
          onClick={() => {
            if (isOpen) closeSearch();
            haptic.trigger('light');
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all pressable ${(pathname === '/discover' || pathname === '/') && !isOpen ? 'text-white' : 'text-[#86847F] hover:text-white'
            }`}
          aria-label="Home"
        >
          <HugeiconsIcon icon={Home01Icon} size={22} />
        </Link>

        <button
          onClick={openSearch}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all pressable ${isOpen ? 'text-white' : 'text-[#86847F] hover:text-white'
            }`}
          aria-label="Search"
          type="button"
        >
          <HugeiconsIcon icon={Search01Icon} size={22} />
        </button>

        {/* Profile avatar link */}
        <Link
          href="/profile"
          onClick={() => {
            if (isOpen) closeSearch();
            haptic.trigger('light');
          }}
          className={`flex items-center justify-center rounded-full border transition-all pressable shrink-0 ${pathname === '/profile' ? 'border-[#6E5B98]' : 'border-white/20'}`}
          aria-label="Profile"
        >
          <div className="relative w-6 h-6 rounded-full overflow-hidden">
            <Image src={navAvatar} alt="Profile" fill className="object-cover" />
          </div>
        </Link>
      </nav>
    </div>
  );
}

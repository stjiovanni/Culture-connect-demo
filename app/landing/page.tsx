'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { LiveTime } from '@/components/LiveTime';
import { useWebHaptics } from 'web-haptics/react';

export default function LandingPage() {
  const router = useRouter();
  const haptic = useWebHaptics();

  const handleCultureConnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    haptic.trigger('success');

    // Simulate login by ensuring user_profile exists in sessionStorage
    try {
      const saved = sessionStorage.getItem('user_profile');
      if (!saved) {
        sessionStorage.setItem(
          'user_profile',
          JSON.stringify({
            firstName: 'Giorno',
            lastName: 'Giovanna',
            username: 'GioGio',
            locationId: 1,
            avatar: '/uploads/avatar_7_1776873674.jpeg',
            banner: '/uploads/header_7_1776873674.jpeg',
          })
        );
        // Dispatch event so active components update profile picture
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (err) {
      console.error('Error logging in:', err);
    }

    router.push('/discover');
  };

  return (
    <>
      {/* Scope font imports to landing page route only */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Stack+Sans+Notch:wght@200..700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
        rel="stylesheet"
      />

      <style>{`
        /* Responsive font-size scaling for typography links */
        .landing-link {
          font-family: 'Stack Sans Notch', sans-serif !important;
          font-weight: 700 !important;
          font-style: normal !important;
          line-height: 1 !important;
          letter-spacing: -0.18rem !important;
          color: #FFF !important;
          font-size: 2.5rem; /* mobile size */
        }
        @media (min-width: 768px) {
          .landing-link {
            font-size: 6rem; /* desktop size */
          }
        }
      `}</style>

      {/* ─── ROOT CONTAINER ─── */}
      <div className="relative w-full h-screen bg-[#010101] overflow-hidden select-none">

        {/* ══════════════════════════════════════════
            BACKGROUND (BIG BEN)
            ══════════════════════════════════════════ */}
        {/* Mobile Big Ben — full bleed object-cover */}
        <div className="md:hidden absolute inset-0 z-0">
          <Image
            src="/home/big-ben.png"
            alt="Big Ben"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Desktop — three-panel layout (London at night | Big Ben | London Underground) */}
        <div className="hidden md:block absolute inset-0 z-0">
          <div className="flex w-full h-full">
            <div className="relative w-1/3 h-full">
              <Image
                src="/home/london-night.png"
                alt="London at night"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="relative w-1/3 h-full">
              <Image
                src="/home/big-ben.png"
                alt="Big Ben"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="relative w-1/3 h-full" />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            GROUP 19 COMPOSITE (RIGHT EDGE)
            ══════════════════════════════════════════ */}
        {/* Mobile Group 19 */}
        <div className="md:hidden absolute bottom-0 right-0 z-10 h-[60vh] pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/Group19.png"
            alt="Group 19"
            className="h-full w-auto object-contain object-right-bottom"
          />
          {/* Dark overlay on mobile to improve text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 65%)' }} />
        </div>

        {/* Desktop Group 19 */}
        <div className="hidden md:block absolute right-0 top-0 h-full z-10 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/Group19.png"
            alt="Group 19"
            className="h-full w-auto object-contain object-right"
          />
          {/* Dark overlay on desktop to improve text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 65%)' }} />
        </div>

        {/* ══════════════════════════════════════════
            LIVE TIME BLOCK (TOP CENTERED)
            ══════════════════════════════════════════ */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
          <p className="text-white text-2xl">UK</p>
          <p className="text-white text-2xl">GMT +0</p>
          <LiveTime />
        </div>

        {/* ══════════════════════════════════════════
            SMALL MAN CUTOUT
            ══════════════════════════════════════════ */}
        {/* Mobile Small Man */}
        <div className="md:hidden absolute bottom-[160px] left-4 z-10 pointer-events-none">
          <Image
            src="/home/small-man.png"
            alt="Silhouette figure"
            width={48}
            height={96}
            className="object-contain"
          />
        </div>

        {/* Desktop Small Man */}
        <div className="hidden md:block absolute bottom-[140px] left-8 z-10 pointer-events-none">
          <Image
            src="/home/small-man.png"
            alt="Silhouette figure"
            width={80}
            height={160}
            className="object-contain"
          />
        </div>

        {/* ══════════════════════════════════════════
            NAVIGATION LINKS (BOTTOM LEFT)
            ══════════════════════════════════════════ */}
        <div className="absolute bottom-6 md:bottom-8 left-4 md:left-8 z-20 flex flex-col gap-1 md:gap-2">
          {/* CULTURE CONNECT */}
          <a
            href="/discover"
            onClick={handleCultureConnectClick}
            className="landing-link flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <span>CULTURE CONNECT</span>
            {/* Desktop icon */}
            <span className="hidden md:inline-flex items-center">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={72} strokeWidth={3} />
            </span>
            {/* Mobile icon */}
            <span className="md:hidden inline-flex items-center">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={36} strokeWidth={3} />
            </span>
          </a>

          {/* ABOUT — layout placeholder, disabled/mocked */}
          <div
            className="landing-link flex items-center gap-3 opacity-50 select-none cursor-not-allowed"
          >
            <span>ABOUT</span>
            {/* Desktop icon */}
            <span className="hidden md:inline-flex items-center">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={72} strokeWidth={3} />
            </span>
            {/* Mobile icon */}
            <span className="md:hidden inline-flex items-center">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={36} strokeWidth={3} />
            </span>
          </div>
        </div>

      </div>
    </>
  );
}

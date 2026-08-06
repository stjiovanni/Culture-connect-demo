"use client";

import { useParams, useRouter } from 'next/navigation';
import { getProductById, getVoteCounts } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ThumbsUpIcon, ThumbsDownIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { useVotes } from '@/context/VoteContext';
import { play } from 'cuelume';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const haptic = useWebHaptics();
  const { toggleVote, hasVoted } = useVotes();
  
  const product = getProductById(Number(id));
  const initialVotes = getVoteCounts(Number(id));
  
  const userVote = hasVoted(Number(id));
  const yesCount = initialVotes.yes + (userVote === 'yes' ? 1 : 0);
  const noCount = initialVotes.no + (userVote === 'no' ? 1 : 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const sheetTranslateY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (imageOpen) {
          setImageOpen(false);
        } else {
          haptic.trigger('light');
          router.back();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router, haptic, imageOpen]);

  useEffect(() => {
    if (imageOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [imageOpen]);

  if (!product) return null;

  const handleVote = (value: 'yes' | 'no') => {
    haptic.trigger('selection');
    toggleVote(product.id, value);
    
    if (userVote === value) {
      play('error');
      setFeedback('Vote removed.');
    } else {
      play('success');
      setFeedback('Vote registered. View votes in profile.');
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  const formattedPrice = `£${product.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const ctaLabel = product.type === 'service' ? `Enquire ${formattedPrice}` : `Purchase ${formattedPrice}`;

  const handleClose = () => {
    setIsClosing(true);
    haptic.trigger('light');
    setTimeout(() => router.back(), 300);
  };

  // Touch handlers for swipe-down-to-close (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0 && sheetRef.current) {
      sheetTranslateY.current = deltaY;
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      sheetRef.current.style.opacity = `${Math.max(0.3, 1 - deltaY / 400)}`;
    }
  };

  const handleTouchEnd = () => {
    if (sheetTranslateY.current > 120) {
      handleClose();
    } else {
      if (sheetTranslateY.current > 0) {
        haptic.trigger('selection');
        if (sheetRef.current) {
          sheetRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
          sheetRef.current.style.transform = 'translateY(0)';
          sheetRef.current.style.opacity = '1';
          setTimeout(() => {
            if (sheetRef.current) {
              sheetRef.current.style.transition = '';
            }
          }, 300);
        }
      }
      sheetTranslateY.current = 0;
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      {/* Background: blurred product image + dark overlay */}
      <div 
        className="fixed inset-0 z-[-2] bg-cover bg-center product-bg-blur bg-[image:var(--bg-image)]"
        style={{ '--bg-image': `url(/uploads/${product.image_filename})` } as React.CSSProperties}
      />
      <div className="fixed inset-0 z-[-1] bg-[#0C0B0A]/70" />

      {/* ═══════════════════════════════════════
          DESKTOP LAYOUT (md+)
          ═══════════════════════════════════════ */}
      <div className="hidden md:block">
        <main className="max-w-[1400px] mx-auto px-10 py-6 pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-20 items-start">
            {/* Left: Image — static, uses card ratio */}
            <div className="md:sticky md:top-6 z-10 self-start flex flex-row items-start gap-[11px]">
              {/* Sticky Circular Back Button */}
              <button 
                onClick={() => { haptic.trigger('light'); router.back(); }}
                className="liquid-glass sticky top-6 z-30 shrink-0 mt-1 w-12 h-12 flex items-center justify-center rounded-full text-white hover:scale-110 transition-all shadow-2xl pressable"
                aria-label="Go back"
                data-cuelume-press
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
              </button>

              <div className="relative w-[80%] aspect-[1000/1414] rounded-[32px] overflow-hidden shadow-2xl bg-[#1A1714] border border-white/5">
                <Image
                  src={`/uploads/${product.image_filename}`}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover cursor-pointer"
                  priority
                  onClick={() => setImageOpen(true)}
                  aria-label="View product image"
                />
                {/* Company Credit Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-lg">
                    {product.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-base leading-none">{product.company_name}</p>
                    <p className="text-white/50 text-xs mt-0.5">@{product.company_name.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col gap-6">
              {/* Title, Vote Buttons, and Pills */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="liquid-glass pl-[9px] pr-3 py-1 rounded-full text-[11px] font-bold text-[#C9C6C0] tracking-[-0.5px]">
                      {product.category}
                    </span>
                    <span className="liquid-glass-strong-purple pl-[9px] pr-3 py-1 rounded-full text-[11px] font-bold text-[#DDD6F3] tracking-[-0.5px]">
                      {product.pricing_category.charAt(0).toUpperCase() + product.pricing_category.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleVote('yes')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 pressable ${
                        userVote === 'yes' 
                          ? 'liquid-glass-green text-[#4ade80]' 
                          : 'liquid-glass text-[#4ade80]/60 hover:text-[#4ade80]'
                      }`}
                      aria-label="Vote yes"
                      data-cuelume-press
                      data-cuelume-hover="tick"
                    >
                      <HugeiconsIcon icon={ThumbsUpIcon} size={16} />
                    </button>
                    <span className="text-sm font-bold text-white tabular-nums">{yesCount}</span>
                    <button 
                      onClick={() => handleVote('no')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 pressable ${
                        userVote === 'no' 
                          ? 'liquid-glass-red text-[#FF7575]' 
                          : 'liquid-glass text-[#FF7575]/60 hover:text-[#FF7575]'
                      }`}
                      aria-label="Vote no"
                      data-cuelume-press
                      data-cuelume-hover="tick"
                    >
                      <HugeiconsIcon icon={ThumbsDownIcon} size={16} />
                    </button>
                    <span className="text-sm font-bold text-white tabular-nums">{noCount}</span>
                  </div>
                </div>
                <h1 className="heading font-bold text-white tracking-tight">{product.name}</h1>
                <p className="body-text text-[#C9C6C0] font-normal">{product.description}</p>
              </div>

              {/* Meta Sections */}
              <div className="flex flex-col gap-6 lg:gap-8 border-t border-white/5 pt-8">
                {product.cultural_benefits && (
                  <div>
<h2 className="heading heading-sm text-white font-bold">Cultural Benefits</h2>
                    <p className="body-text text-[#C9C6C0] font-normal">{product.cultural_benefits}</p>
                  </div>
                )}
                {product.size_quantity && (
                  <div>
<h2 className="heading heading-sm text-white font-bold">Size / Quantity</h2>
                    <p className="body-text text-[#C9C6C0] font-normal">{product.size_quantity}</p>
                  </div>
                )}
                <div>
<h2 className="heading heading-sm text-white font-bold flex items-center gap-2 mb-0">
                    <span>Location</span>
                  </h2>
                  <p className="body-text text-[#C9C6C0] mt-1">{product.area_name}</p>
                </div>
                {product.awards && (
                  <div>
                    <h2 className="heading heading-sm text-white font-bold">Awards</h2>
                    <p className="body-text text-[#C9C6C0] font-normal">{product.awards}</p>
                  </div>
                )}
              </div>

              {/* CTA — static, sits after last meta field */}
              <div className="mt-8 pb-8">
                <button 
                  onClick={() => haptic.trigger('success')}
                  className="btn-text w-full liquid-glass-strong-purple text-white py-4 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.96] pressable outline-none border-0"
                  data-cuelume-press
                  data-cuelume-hover="tick"
                >
                  {ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE LAYOUT — Bottom Sheet
          ═══════════════════════════════════════ */}
      <motion.div 
        ref={sheetRef}
        className={`md:hidden fixed inset-0 z-50 flex flex-col [will-change:transform,opacity] ${isClosing ? 'product-sheet-closing' : 'product-sheet'}`}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 1 }}
      >
        {/* Blurred bg for mobile */}
        <div 
          className="fixed inset-0 z-[-2] bg-cover bg-center product-bg-blur bg-[image:var(--bg-image)]"
          style={{ '--bg-image': `url(/uploads/${product.image_filename})` } as React.CSSProperties}
        />
        <div className="fixed inset-0 z-[-1] bg-[#0C0B0A]/80" />

        {/* Drag Handle + Close */}
        <div 
          className="relative z-[5] flex items-center justify-between px-4 pt-3 pb-2 bg-transparent"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            onClick={handleClose}
            className="liquid-glass-modal w-10 h-10 flex items-center justify-center rounded-full text-white pressable"
            aria-label="Close"
            data-cuelume-press
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative z-10 px-6 scroll-area"
        >

          {/* Outer div reserves space in flow — no sticky here */}
          <div className="w-full flex justify-center mb-6">
            <div
              className="relative w-[65%] cursor-pointer"
              onClick={() => setImageOpen(true)}
              aria-label="View product image"
            >
              <div className="relative w-full aspect-[1000/1414] rounded-[20px] overflow-hidden shadow-2xl border border-white/5">
                <Image
                  src={`/uploads/${product.image_filename}`}
                  alt={product.name}
                  fill
                  sizes="70vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Mobile Pill Tags — before the title */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="pl-[9px] pr-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#C9C6C0] tracking-[-0.5px]">
              {product.category}
            </span>
            <span className="pl-[9px] pr-3 py-1 rounded-full bg-[#6E5B98]/20 border border-[#6E5B98]/30 text-[11px] font-bold text-[#DDD6F3] tracking-[-0.5px]">
              {product.pricing_category.charAt(0).toUpperCase() + product.pricing_category.slice(1)}
            </span>
          </div>

          {/* Name, Price, and Vote Buttons (Mobile) */}
          <div className="bg-transparent pt-2">
            <div className="flex items-start justify-between">
              <h1 className="heading font-bold text-white flex-1 mr-4">{product.name}</h1>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-2xl font-bold text-white">{formattedPrice}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleVote('yes')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 pressable ${
                      userVote === 'yes' 
                        ? 'liquid-glass-green text-[#4ade80]' 
                        : 'liquid-glass text-[#4ade80]/60 hover:text-[#4ade80]'
                    }`}
                    aria-label="Vote yes"
                    data-cuelume-press
                    data-cuelume-hover="tick"
                  >
                    <HugeiconsIcon icon={ThumbsUpIcon} size={14} />
                  </button>
                  <button 
                    onClick={() => handleVote('no')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 pressable ${
                      userVote === 'no' 
                        ? 'liquid-glass-red text-[#FF7575]' 
                        : 'liquid-glass text-[#FF7575]/60 hover:text-[#FF7575]'
                    }`}
                    aria-label="Vote no"
                    data-cuelume-press
                    data-cuelume-hover="tick"
                  >
                    <HugeiconsIcon icon={ThumbsDownIcon} size={14} />
                  </button>
                </div>
              </div>
            </div>
            <p className="body-text text-[#9E9B96] font-normal mb-6 lg:mb-8">{product.description}</p>
          </div>

          {/* Meta */}
          {product.cultural_benefits && (
            <div>
              <h2 className="heading heading-sm text-white font-bold">Cultural Benefits</h2>
              <p className="body-text text-[#9E9B96] font-normal mb-6 lg:mb-8">{product.cultural_benefits}</p>
            </div>
          )}

          {product.size_quantity && (
            <div>
              <h2 className="heading heading-sm text-white font-bold">Size / Quantity</h2>
              <p className="body-text text-[#9E9B96] font-normal mb-6 lg:mb-8">{product.size_quantity}</p>
            </div>
          )}

          <div>
            <h2 className="heading heading-sm text-white font-bold flex items-center gap-2 mb-0">
              <span>Location</span>
            </h2>
            <p className="body-text text-[#9E9B96] mt-1">{product.area_name}</p>
          </div>

          {/* Spacer for sticky CTA */}
          <div className="h-24" />
        </div>

        {/* Sticky CTA — bottom of mobile sheet */}
        <div 
          className="sticky bottom-0 z-50 px-6 pt-4 bg-transparent"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
        >
          <button 
            onClick={() => haptic.trigger('success')}
            className="btn-text w-full liquid-glass-strong-purple text-white py-4 rounded-full font-bold transition-all active:scale-[0.96] pressable outline-none border-0"
            data-cuelume-press
            data-cuelume-hover="tick"
          >
            {ctaLabel}
          </button>
        </div>
      </motion.div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="toast">
          {feedback}
        </div>
      )}

      {/* Product Image Lightbox */}
      {imageOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-6"
          style={{ overscrollBehavior: 'contain' }}
          onClick={() => setImageOpen(false)}
        >
          <div className="gallery-backdrop" aria-hidden="true" />
          <div
            className="relative z-10 flex max-h-[90vh] w-full max-w-[900px] flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[78vh] w-[min(90vw,800px)] animate-in zoom-in-95 duration-200">
              <Image
                src={`/uploads/${product.image_filename}`}
                alt={product.name}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={() => setImageOpen(false)}
              className="liquid-glass-modal mt-4 flex h-12 w-12 items-center justify-center rounded-full text-white pressable"
              aria-label="Close image"
              data-cuelume-press
            >
              <HugeiconsIcon icon={Cancel01Icon} size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useParams, useRouter } from 'next/navigation';
import { getProductById, getVoteCounts } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Location01Icon, ThumbsUpIcon, ThumbsDownIcon } from '@hugeicons/core-free-icons';
import { useVotes } from '@/context/VoteContext';

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
  const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const sheetTranslateY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        haptic.trigger('light');
        router.back();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [router, haptic]);

  if (!product) return null;

  const handleVote = (value: 'yes' | 'no') => {
    haptic.trigger('selection');
    toggleVote(product.id, value);
    
    if (userVote === value) {
      setFeedback({ text: 'Vote removed', color: '#FFFFFF' });
    } else {
      setFeedback({ 
        text: value === 'yes' ? 'Vote counted, thanks!' : 'Vote counted', 
        color: '#FFFFFF' 
      });
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

  // Scroll handler — shrink image as user scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newScale = Math.max(0.6, 1 - scrollTop / 600);
    setImageScale(newScale);
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
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
      sheetRef.current.style.opacity = '1';
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left: Image — static, uses card ratio */}
            <div className="lg:sticky lg:top-32 z-10 flex flex-col gap-8">
              {/* Sticky Circular Back Button */}
              <button 
                onClick={() => { haptic.trigger('light'); router.back(); }}
                className="sticky top-10 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white hover:bg-black/60 hover:scale-110 transition-all shadow-2xl pressable"
                aria-label="Go back"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
              </button>

              <div className="relative h-[36vh] aspect-[1000/1414] rounded-[32px] overflow-hidden shadow-2xl bg-[#1A1714] border border-white/5">
                <Image
                  src={`/uploads/${product.image_filename}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Company Credit Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-lg">
                    {product.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-none">{product.company_name}</p>
                    <p className="text-white/50 text-xs mt-0.5">@{product.company_name.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col gap-6">
              {/* Top Meta: Tags & Hearts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#C9C6C0]">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#6E5B98]/20 border border-[#6E5B98]/30 text-[11px] font-bold text-[#DDD6F3]">
                    {product.pricing_category.charAt(0).toUpperCase() + product.pricing_category.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleVote('yes')}
                    className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 pressable ${
                      userVote === 'yes' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-[#9E9B96] hover:scale-110 hover:text-white'
                    }`}
                    aria-label="Vote yes"
                  >
                    <HugeiconsIcon icon={ThumbsUpIcon} size={16} />
                  </button>
                  <span className="text-sm font-bold text-white tabular-nums">{yesCount}</span>
                  <button 
                    onClick={() => handleVote('no')}
                    className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 pressable ${
                      userVote === 'no' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-[#9E9B96] hover:scale-110 hover:text-white'
                    }`}
                    aria-label="Vote no"
                  >
                    <HugeiconsIcon icon={ThumbsDownIcon} size={16} />
                  </button>
                  <span className="text-sm font-bold text-white tabular-nums">{noCount}</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight leading-[1.1]">{product.name}</h1>

              {/* Description */}
              <p className="text-[#C9C6C0] text-[15px] font-medium leading-relaxed">{product.description}</p>

              {/* Meta Sections */}
              <div className="flex flex-col gap-6 border-t border-white/5 pt-8">
                {product.cultural_benefits && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-white text-[14px] font-bold">Cultural Benefits</h3>
                    <p className="text-[#C9C6C0] text-[14px] leading-relaxed">{product.cultural_benefits}</p>
                  </div>
                )}
                {product.size_quantity && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-white text-[14px] font-bold">Size / Quantity</h3>
                    <p className="text-[#C9C6C0] text-[14px] leading-relaxed">{product.size_quantity}</p>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-white text-[14px] font-bold">Location</h3>
                  <div className="flex items-center gap-2 text-[#C9C6C0] text-[14px]">
                    <HugeiconsIcon icon={Location01Icon} size={16} className="text-[#6E5B98]" />
                    {product.area_name}
                  </div>
                </div>
                {product.awards && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-white text-[14px] font-bold">Awards</h3>
                    <p className="text-[#C9C6C0] text-[14px] leading-relaxed">{product.awards}</p>
                  </div>
                )}
              </div>



              {/* CTA — sticky on desktop */}
              <div className="sticky bottom-6 pt-6 bg-[#0C0B0A]/80 backdrop-blur-xl rounded-2xl px-6 py-4 -mx-6 border-t border-white/[0.06]">
                <button 
                  onClick={() => haptic.trigger('success')}
                  className="w-full bg-[#6E5B98] hover:bg-[#5C4A85] text-white py-4 rounded-full font-bold text-base shadow-2xl shadow-[#6E5B98]/20 transition-all hover:scale-[1.02] active:scale-[0.96] pressable outline-none border-0"
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
      <div 
        ref={sheetRef}
        className={`md:hidden fixed inset-0 z-50 flex flex-col [will-change:transform,opacity] [transition:transform_0.15s_ease-out,opacity_0.15s_ease-out] ${isClosing ? 'product-sheet-closing' : 'product-sheet'}`}
      >
        {/* Blurred bg for mobile */}
        <div 
          className="fixed inset-0 z-[-2] bg-cover bg-center product-bg-blur bg-[image:var(--bg-image)]"
          style={{ '--bg-image': `url(/uploads/${product.image_filename})` } as React.CSSProperties}
        />
        <div className="fixed inset-0 z-[-1] bg-[#0C0B0A]/80" />

        {/* Drag Handle + Close */}
        <div 
          className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white pressable"
            aria-label="Close"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative z-10 px-6"
          onScroll={handleScroll}
        >
          {/* Product Image — shrinks on scroll */}
          <div 
            className="flex justify-center my-6 transition-transform duration-100 origin-top [will-change:transform] [transform:scale(var(--image-scale))]"
            style={{ '--image-scale': imageScale } as React.CSSProperties}
          >
            <div className="relative w-[65%] aspect-[1000/1414] rounded-[20px] overflow-hidden shadow-2xl border border-white/5">
              <Image
                src={`/uploads/${product.image_filename}`}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Name + Price */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-white leading-tight flex-1 mr-4">{product.name}</h1>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-2xl font-bold text-white">{formattedPrice}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote('yes')}
                  className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 pressable ${
                    userVote === 'yes' ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-[#9E9B96]'
                  }`}
                  aria-label="Vote yes"
                >
                  <HugeiconsIcon icon={ThumbsUpIcon} size={14} />
                </button>
                <button 
                  onClick={() => handleVote('no')}
                  className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 pressable ${
                    userVote === 'no' ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-[#9E9B96]'
                  }`}
                  aria-label="Vote no"
                >
                  <HugeiconsIcon icon={ThumbsDownIcon} size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#9E9B96] text-[14px] leading-relaxed mb-6">{product.description}</p>

          {/* Meta */}
          {product.cultural_benefits && (
            <div className="mb-4">
              <h3 className="text-white text-[13px] font-bold mb-1">Cultural Benefits</h3>
              <p className="text-[#9E9B96] text-[13px] leading-relaxed">{product.cultural_benefits}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-[#9E9B96] text-[13px] mb-6">
            <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#6E5B98]" />
            {product.area_name}
          </div>



          {/* Spacer for sticky CTA */}
          <div className="h-24" />
        </div>

        {/* Sticky CTA — bottom of mobile sheet */}
        <div className="sticky bottom-0 z-20 px-6 pb-8 pt-4 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/90 to-transparent">
          <button 
            onClick={() => haptic.trigger('success')}
            className="w-full bg-[#6E5B98] hover:bg-[#5C4A85] text-white py-4 rounded-full font-bold text-base shadow-2xl shadow-[#6E5B98]/20 transition-all active:scale-[0.96] pressable outline-none border-0"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="toast text-[color:var(--toast-color)]" style={{ '--toast-color': feedback.color } as React.CSSProperties}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}

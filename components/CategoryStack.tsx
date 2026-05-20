"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useVotes } from '@/context/VoteContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { ThumbsUpIcon, ThumbsDownIcon } from '@hugeicons/core-free-icons';

interface CategoryStackProps {
  category: string;
  items: Product[];
  haptic: ReturnType<typeof useWebHaptics>;
  loop?: boolean;
}

export default function CategoryStack({ category, items, haptic, loop = true }: CategoryStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVoteAction, setShowVoteAction] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const { toggleVote, hasVoted } = useVotes();

  const clearTimer = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragX(-400); // Fly off left

    setTimeout(() => {
      setDragX(0);
      setIsAnimating(false);
      setCurrentIndex(prev => {
        if (prev < items.length - 1) return prev + 1;
        return loop ? 0 : prev;
      });
      haptic.trigger('selection');
    }, 300);
  }, [isAnimating, items.length, loop, haptic]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragX(400); // Fly off right

    setTimeout(() => {
      setDragX(0);
      setIsAnimating(false);
      setCurrentIndex(prev => {
        if (prev > 0) return prev - 1;
        return loop ? items.length - 1 : prev;
      });
      haptic.trigger('selection');
    }, 300);
  }, [isAnimating, items.length, loop, haptic]);

  const onStart = (clientX: number) => {
    if (isAnimating) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startX.current = clientX;

    if (items.length > 0) {
      const topProduct = items[(currentIndex) % items.length];
      pressTimer.current = setTimeout(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
        setShowVoteAction(topProduct.id);
      }, 500);
    }
  };

  const onMove = (clientX: number) => {
    if (!isDraggingRef.current || isAnimating) return;
    const diff = clientX - startX.current;
    if (Math.abs(diff) > 10) {
      clearTimer();
      setShowVoteAction(null);
    }
    setDragX(diff);
  };

  const onEnd = () => {
    clearTimer();
    if (!isDragging || isAnimating) return;
    setIsDragging(false);
    isDraggingRef.current = false;

    if (dragX < -100) {
      handleNext();
    } else if (dragX > 100) {
      handlePrev();
    } else {
      setDragX(0); // snap back only
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // isTrackpadSwipe logic
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 5) {
        e.preventDefault();
        if (e.deltaX > 30) {
          handleNext();
        } else if (e.deltaX < -30) {
          handlePrev();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleNext, handlePrev]);

  const visibleItems = useMemo(() => {
    const stack = [];
    const maxItems = Math.min(3, items.length);
    for (let i = 0; i < maxItems; i++) {
      const idx = (currentIndex + i) % items.length;
      if (!loop && currentIndex + i >= items.length) break;
      stack.push({ product: items[idx], level: i });
      if (items.length === 1) break; // Fix 1: ensure only 1 item pushed
    }
    return stack;
  }, [items, currentIndex, loop]);

  const stackStyles = useMemo(() => {
    return visibleItems.map(({ level }) => {
      const isTop = level === 0;
      const progress = Math.min(Math.abs(dragX) / 200, 1);

      let scale = 1;
      let translateY = 0;
      let opacity = 1;
      let translateX = 0;

      if (items.length > 1) {
        if (isTop) {
          translateX = dragX;
          opacity = 1;
        } else if (level === 1) {
          scale = 0.95 + progress * 0.05;
          translateY = 12 * (1 - progress);
          opacity = 0.6 + progress * 0.4;
        } else if (level === 2) {
          scale = 0.90 + progress * 0.05;
          translateY = 24 - 12 * progress;
          opacity = 0.35 + progress * 0.25;
        }
      }

      return {
        '--tx': `${translateX}px`,
        '--ty': `${translateY}px`,
        '--ts': scale,
        '--op': opacity,
        '--z': 10 - level,
        '--trans': isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
      } as React.CSSProperties;
    });
  }, [visibleItems, dragX, items.length, isDragging]);



  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-white font-bold text-center text-sm tracking-tight">{category}</h4>
      <div
        ref={containerRef}
        className="relative aspect-[1000/1414] select-none touch-none"
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        <div className="category-badge tabular-nums">{items.length}</div>

        <div className="relative w-full h-full">
          {visibleItems.map(({ product, level }, index) => {
            const isTop = level === 0;

            return (
              <div
                key={product.id}
                className="category-stack-card shadow-2xl [will-change:transform,opacity] [transform:translateX(var(--tx))_translateY(var(--ty))_scale(var(--ts))] opacity-[var(--op)] z-[var(--z)] [transition:var(--trans)]"
                style={stackStyles[index]}
              >
                <Image
                  src={`/uploads/${product.image_filename}`}
                  alt={product.name}
                  fill
                  className="object-cover pointer-events-none"
                />

                {showVoteAction === product.id && isTop && (
                  <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center gap-6 rounded-[24px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVote(product.id, 'yes'); setShowVoteAction(null); haptic.trigger('selection'); }}
                      aria-label="Vote yes"
                      className={`w-14 h-14 rounded-full border-[1.5px] flex items-center justify-center transition-all pressable ${
                        hasVoted(product.id) === 'yes' 
                          ? 'bg-[#4ade80]/20 border-[#4ade80] text-[#4ade80]' 
                          : 'bg-[#4ade80]/5 border-[#4ade80]/10 text-[#4ade80]/60 hover:bg-[#4ade80]/10'
                      }`}
                    >
                      <HugeiconsIcon icon={ThumbsUpIcon} size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVote(product.id, 'no'); setShowVoteAction(null); haptic.trigger('selection'); }}
                      aria-label="Vote no"
                      className={`w-14 h-14 rounded-full border-[1.5px] flex items-center justify-center transition-all pressable ${
                        hasVoted(product.id) === 'no' 
                          ? 'bg-[#FF7575]/20 border-[#FF7575] text-[#FF7575]' 
                          : 'bg-[#FF7575]/5 border-[#FF7575]/10 text-[#FF7575]/60 hover:bg-[#FF7575]/10'
                      }`}
                    >
                      <HugeiconsIcon icon={ThumbsDownIcon} size={24} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Link to top product */}
        {visibleItems.length > 0 && !showVoteAction && (
          <Link
            href={`/product/${visibleItems[0].product.id}`}
            onClick={(e) => {
              if (Math.abs(dragX) > 5) e.preventDefault();
              else haptic.trigger('light');
            }}
            className="absolute inset-0 z-20 rounded-[28px]"
          />
        )}
      </div>
    </div>
  );
}

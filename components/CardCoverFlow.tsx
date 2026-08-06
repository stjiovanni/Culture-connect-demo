"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Product } from "@/lib/data";

interface CardCoverFlowProps {
  products: Product[];
  onOpen?: (product: Product) => void;
  onLongPress?: (product: Product) => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const RESISTANCE = 0.6;
const MAX_DRAG = 120;

export default function CardCoverFlow({ products, onOpen, onLongPress, className = '' }: CardCoverFlowProps) {
  const [activeIndex, setActiveIndex] = useState(
    products.length > 0 ? Math.min(2, products.length - 1) : 0
  );
  const [dragX, setDragX] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelAccum = useRef(0);

  const gesture = useRef({
    active: false,
    startX: 0,
    startY: 0,
    delta: 0,
    moved: false,
    longPressed: false,
  });

  if (products.length === 0) return null;

  const goPrev = () => setActiveIndex(p => Math.max(0, p - 1));
  const goNext = () => setActiveIndex(p => Math.min(products.length - 1, p + 1));

  const activeProduct = products[activeIndex];

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        wheelAccum.current += e.deltaX;
        if (wheelAccum.current > SWIPE_THRESHOLD) {
          wheelAccum.current = 0;
          goNext();
        } else if (wheelAccum.current < -SWIPE_THRESHOLD) {
          wheelAccum.current = 0;
          goPrev();
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const onStart = (clientX: number, clientY: number) => {
    const g = gesture.current;
    g.active = true;
    g.startX = clientX;
    g.startY = clientY;
    g.delta = 0;
    g.moved = false;
    g.longPressed = false;
    setDragX(0);
    clearPress();
    pressTimerRef.current = setTimeout(() => {
      const cur = gesture.current;
      if (cur.active && !cur.moved && !cur.longPressed) {
        cur.longPressed = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
        onLongPress?.(activeProduct);
      }
    }, 550);
  };

  const onMove = (clientX: number, clientY: number) => {
    const g = gesture.current;
    if (!g.active) return;
    const delta = clientX - g.startX;
    g.delta = delta;
    if (Math.abs(delta) > 10 || Math.abs(clientY - g.startY) > 10) {
      if (!g.moved) {
        g.moved = true;
        clearPress();
      }
    }
    if (g.longPressed) return;
    setDragX(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta * RESISTANCE)));
  };

  const onCancelEnd = () => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    clearPress();
    setDragX(0);
  };

  const onEnd = () => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    clearPress();
    if (g.longPressed) {
      setDragX(0);
      return;
    }
    setDragX(0);
    if (g.moved) {
      if (g.delta < -SWIPE_THRESHOLD) goNext();
      else if (g.delta > SWIPE_THRESHOLD) goPrev();
    } else {
      onOpen?.(activeProduct);
    }
  };

  const bindStart = (
    handler: (x: number, y: number) => void
  ) => ({
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      handler(t.clientX, t.clientY);
    },
    onMouseDown: (e: React.MouseEvent) => handler(e.clientX, e.clientY),
  });

  const bindMove = (
    handler: (x: number, y: number) => void
  ) => ({
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      handler(t.clientX, t.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => handler(e.clientX, e.clientY),
  });

  return (
    <div className={`relative flex flex-col items-center gap-3 [perspective:1000px] ${className}`}>
      <div
        ref={deckRef}
        className="relative w-full select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        {...bindStart(onStart)}
        {...bindMove(onMove)}
        onTouchEnd={onEnd}
        onTouchCancel={onCancelEnd}
        onMouseUp={onEnd}
        onMouseLeave={onCancelEnd}
      >
        <motion.div
          className="relative h-[140px] w-full flex items-center justify-center [transform-style:preserve-3d]"
          animate={{ x: dragX }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {products.map((item, i) => {
            const isActive = activeIndex === i;
            const offset = i - activeIndex;
            const absOffset = Math.abs(offset);
            const isPast = i < activeIndex;
            return (
              <motion.div
                key={item.id}
                className={`absolute w-[80px] aspect-[3/4] ${isActive ? 'cursor-pointer' : ''}`}
                initial={false}
                animate={{
                  x: offset * 32,
                  rotateY: isActive ? 0 : (isPast ? 38 : -38),
                  z: isActive ? 50 : -absOffset * 50,
                  scale: isActive ? 1.1 : 1 - (absOffset * 0.08),
                  opacity: absOffset > 2 ? 0 : 1 - (absOffset * 0.25)
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{ zIndex: 100 - absOffset }}
              >
                <div
                  className="relative w-full h-full"
                  style={{ pointerEvents: 'none' }}
                  data-cuelume-hover="tick"
                >
                  <Image
                    src={`/uploads/${item.image_filename}`}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover rounded-xl shadow-2xl border border-white/10 pointer-events-none"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/5 backdrop-blur border border-white/10 rounded-full">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={activeIndex === 0}
          aria-label="Previous card"
          data-cuelume-hover="tick"
          data-cuelume-press
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {products.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
            data-cuelume-hover="tick"
            data-cuelume-press
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${activeIndex === i ? 'bg-white scale-125' : 'bg-white/30'}`}
          />
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={activeIndex === products.length - 1}
          aria-label="Next slide"
          data-cuelume-hover="tick"
          data-cuelume-press
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {activeProduct && (
        <p className="text-white/90 text-xs font-medium text-center truncate w-full px-2">
          {activeProduct.name}
        </p>
      )}
    </div>
  );
}
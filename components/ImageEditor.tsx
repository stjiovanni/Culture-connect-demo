"use client";

import { useEffect, useRef, useState } from 'react';

type Filter = { name: string; value: string };

const FILTERS: Filter[] = [
  { name: 'Original', value: 'none' },
  { name: 'Warm', value: 'saturate(1.12) sepia(.16) contrast(1.04)' },
  { name: 'Mono', value: 'grayscale(1) contrast(1.08)' },
  { name: 'Fade', value: 'saturate(.72) contrast(.94) brightness(1.08)' },
];

export default function ImageEditor({
  src,
  aspect,
  label,
  circular = false,
  onConfirm,
  onCancel,
}: {
  src: string;
  aspect: number;
  label: string;
  circular?: boolean;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState(FILTERS[0]);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = src;
  }, [src]);

  useEffect(() => {
    if (!frameRef.current) return;
    const observer = new ResizeObserver(() => {
      if (frameRef.current) setFrameSize({ width: frameRef.current.clientWidth, height: frameRef.current.clientHeight });
    });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragStart.current = { x: event.clientX, y: event.clientY, offset };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      dragStart.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(Math.max(1, Math.min(3, pinchStart.current.zoom * distance / pinchStart.current.distance)));
    } else if (dragStart.current) {
      setOffset({ x: dragStart.current.offset.x + event.clientX - dragStart.current.x, y: dragStart.current.offset.y + event.clientY - dragStart.current.y });
    }
  };

  const releasePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (!pointers.current.size) {
      dragStart.current = null;
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom(value => Math.max(1, Math.min(3, value - event.deltaY * 0.001)));
  };

  const apply = () => {
    const frame = frameRef.current;
    if (!frame || !imageSize.width) return;
    const width = 1200;
    const height = Math.round(width / aspect);
    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    const baseScale = Math.max(frameWidth / imageSize.width, frameHeight / imageSize.height);
    const scale = baseScale * zoom * width / frameWidth;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.filter = filter.value;
    context.translate(width / 2, height / 2);
    context.rotate(rotation * Math.PI / 180);
    context.translate(offset.x * width / frameWidth, offset.y * height / frameHeight);
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, -imageSize.width * scale / 2, -imageSize.height * scale / 2, imageSize.width * scale, imageSize.height * scale);
      onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.src = src;
  };

  const imageScale = imageSize.width && frameSize.width ? Math.max(frameSize.width / imageSize.width, frameSize.height / imageSize.height) : 1;
  const imageStyle = {
    width: `${imageSize.width * imageScale * zoom}px`,
    height: `${imageSize.height * imageScale * zoom}px`,
    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
    filter: filter.value,
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#080706] text-white">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-white/[0.08]">
        <button type="button" onClick={onCancel} className="min-w-10 min-h-10 text-[#B5B1AA] text-sm font-semibold active:scale-[0.96] transition-transform">Cancel</button>
        <div className="text-center"><p className="text-[11px] uppercase tracking-[.18em] text-[#8B867E]">{label}</p><p className="text-sm font-semibold mt-0.5">Adjust image</p></div>
        <button type="button" onClick={apply} className="min-h-10 rounded-full bg-[#8069B0] px-4 text-sm font-bold active:scale-[0.96] transition-transform">Use photo</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6 min-h-0">
        <p className="text-xs text-[#9E9B96]">Drag to position · pinch or scroll to zoom</p>
        <div
          ref={frameRef}
          className={`relative w-full max-w-[560px] overflow-hidden bg-[#1A1714] shadow-[0_20px_60px_rgba(0,0,0,.45)] touch-none select-none ${circular ? 'rounded-full' : 'rounded-[18px]'}`}
          style={{ aspectRatio: `${aspect}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onWheel={handleWheel}
        >
          {/* Browser image elements are required here for data-URL previews and canvas export. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Image preview" className="pointer-events-none absolute left-1/2 top-1/2 max-w-none will-change-transform" style={imageStyle} />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_49.8%,white_50%,transparent_50.2%),linear-gradient(0deg,transparent_49.8%,white_50%,transparent_50.2%)]" />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setRotation(value => value - 90)} aria-label="Rotate left" className="min-w-11 min-h-11 rounded-full bg-white/[0.08] text-lg active:scale-[0.96] transition-transform">↺</button>
          <button type="button" onClick={() => setZoom(value => Math.max(1, value - .1))} aria-label="Zoom out" className="min-w-11 min-h-11 rounded-full bg-white/[0.08] text-lg active:scale-[0.96] transition-transform">−</button>
          <span className="w-12 text-center text-xs text-[#B5B1AA] tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(value => Math.min(3, value + .1))} aria-label="Zoom in" className="min-w-11 min-h-11 rounded-full bg-white/[0.08] text-lg active:scale-[0.96] transition-transform">+</button>
          <button type="button" onClick={() => setRotation(value => value + 90)} aria-label="Rotate right" className="min-w-11 min-h-11 rounded-full bg-white/[0.08] text-lg active:scale-[0.96] transition-transform">↻</button>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/[0.08] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[#8B867E]">Looks</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {FILTERS.map(option => (
            <button type="button" key={option.name} onClick={() => setFilter(option)} className={`shrink-0 text-xs ${filter.name === option.name ? 'text-white' : 'text-[#8B867E]'}`}>
              <span className={`mb-1 block h-14 w-14 overflow-hidden rounded-xl border-2 ${filter.name === option.name ? 'border-[#A48AD8]' : 'border-white/10'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" style={{ filter: option.value }} />
              </span>
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

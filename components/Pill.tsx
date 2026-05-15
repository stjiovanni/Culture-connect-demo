"use client";

import React, { useMemo, useId } from 'react';
import { getContrastColor } from '@/lib/utils';

interface PillProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string; // Optional hex color, otherwise defaults to glass-pill style
}

function capitalize(text: React.ReactNode): React.ReactNode {
  if (typeof text === 'string') {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
}

export default function Pill({ children, className = '', bgColor }: PillProps) {
  const contrastColor = useMemo(() => {
    if (!bgColor) return null;
    return getContrastColor(bgColor);
  }, [bgColor]);

  const baseId = useId();
  const pillId = useMemo(() => `pill-${baseId.replace(/:/g, '')}`, [baseId]);

  return (
    <>
      {bgColor && (
        <style>{`
          .${pillId} {
            background-color: ${bgColor};
            color: ${contrastColor === 'black' ? '#000000' : '#FFFFFF'};
          }
        `}</style>
      )}
      <span 
        className={`${bgColor ? pillId : ''} text-[10px] font-semibold tracking-tight px-3 py-1 rounded-[32px] transition-colors duration-300 whitespace-nowrap ${!bgColor ? 'bg-black/20 backdrop-blur-xl border border-white/10 text-white' : ''} ${className}`}
      >
        {capitalize(children)}
      </span>
    </>
  );
}

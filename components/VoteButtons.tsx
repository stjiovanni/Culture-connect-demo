"use client";

import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ThumbsUpIcon, ThumbsDownIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { useViewMode } from '../context/ViewModeContext';
import { useWebHaptics } from 'web-haptics/react';

interface VoteButtonsProps {
  productId: number;
  initialVotes: { yes: number; no: number };
}

export default function VoteButtons({ productId, initialVotes }: VoteButtonsProps) {
  const { viewMode } = useViewMode();
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  const [votes, setVotes] = useState(initialVotes);
  const haptic = useWebHaptics();

  useEffect(() => {
    const stored = localStorage.getItem(`vote_${productId}`);
    if (stored === 'yes' || stored === 'no') {
      setVoted(stored);
    }
  }, [productId]);

  const handleVote = (value: 'yes' | 'no') => {
    if (voted) {
      haptic.trigger('error');
      return;
    }
    
    localStorage.setItem(`vote_${productId}`, value);
    setVoted(value);
    setVotes(prev => ({
      ...prev,
      [value]: prev[value] + 1
    }));
    haptic.trigger('success');
  };

  if (viewMode === 'admin') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[100px] p-6 text-center mt-8 backdrop-blur-md">
        <p className="body-text text-[#86847F]">Admin view — voting disabled</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {voted && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#DDD6F3] bg-white/5 backdrop-blur-md py-4 rounded-[100px] border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[var(--ease-drawer)]">
          <HugeiconsIcon icon={Tick01Icon} size={18} className="text-[#6E5B98]" />
          <span className="font-bold">You voted {voted === 'yes' ? 'Yes' : 'No'}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-5">
        <button
          onClick={() => handleVote('yes')}
          disabled={voted !== null}
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-[16px] transition-all duration-500 pressable ${
            voted === 'yes' 
              ? 'liquid-glass-green text-[#4ade80]' 
              : voted !== null 
                ? 'liquid-glass text-[#86847F] opacity-40 cursor-not-allowed' 
                : 'liquid-glass text-[#4ade80]/60 hover:text-[#4ade80]'
          }`}
        >
          <HugeiconsIcon icon={ThumbsUpIcon} size={24} className={`${voted === 'yes' ? 'scale-110' : ''} transition-transform duration-500`} />
          <span className="text-[11px] font-bold tracking-tight opacity-60">Agree</span>
          <span className="text-xl font-black italic">({votes.yes})</span>
        </button>
        
        <button
          onClick={() => handleVote('no')}
          disabled={voted !== null}
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-[16px] transition-all duration-500 pressable ${
            voted === 'no' 
              ? 'liquid-glass-red text-[#FF7575]' 
              : voted !== null 
                ? 'liquid-glass text-[#86847F] opacity-40 cursor-not-allowed' 
                : 'liquid-glass text-[#FF7575]/60 hover:text-[#FF7575]'
          }`}
        >
          <HugeiconsIcon icon={ThumbsDownIcon} size={24} className={`${voted === 'no' ? 'scale-110' : ''} transition-transform duration-500`} />
          <span className="text-[11px] font-bold tracking-tight opacity-60">Disagree</span>
          <span className="text-xl font-black italic">({votes.no})</span>
        </button>
      </div>
    </div>
  );
}


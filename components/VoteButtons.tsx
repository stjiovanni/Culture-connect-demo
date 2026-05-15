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
        <p className="text-sm text-[#86847F] font-medium">Admin view — voting disabled</p>
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
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-[16px] border transition-all duration-500 pressable ${
            voted === 'yes' 
              ? 'bg-white text-black border-white shadow-2xl shadow-white/10' 
              : voted !== null 
                ? 'bg-transparent border-white/5 text-[#86847F] opacity-40 cursor-not-allowed' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white'
          }`}
        >
          <HugeiconsIcon icon={ThumbsUpIcon} size={24} className={`${voted === 'yes' ? 'scale-110' : ''} transition-transform duration-500`} />
          <span className="text-[11px] font-bold tracking-tight opacity-60">Agree</span>
          <span className="text-xl font-black italic">({votes.yes})</span>
        </button>
        
        <button
          onClick={() => handleVote('no')}
          disabled={voted !== null}
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-[16px] border transition-all duration-500 pressable ${
            voted === 'no' 
              ? 'bg-[#FF7575] text-white border-[#FF7575] shadow-2xl shadow-[#FF7575]/20' 
              : voted !== null 
                ? 'bg-transparent border-white/5 text-[#86847F] opacity-40 cursor-not-allowed' 
                : 'bg-white/5 border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white hover:text-red-400'
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


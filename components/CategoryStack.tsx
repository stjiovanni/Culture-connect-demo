"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Product } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useVotes } from '@/context/VoteContext';
import { HugeiconsIcon } from '@hugeicons/react';
import { ThumbsUpIcon, ThumbsDownIcon } from '@hugeicons/core-free-icons';
import CardCoverFlow from '@/components/CardCoverFlow';

interface CategoryStackProps {
  category: string;
  items: Product[];
  haptic: ReturnType<typeof useWebHaptics>;
  loop?: boolean;
}

export default function CategoryStack({ category, items, haptic, loop = true }: CategoryStackProps) {
  const router = useRouter();
  const { toggleVote, hasVoted } = useVotes();

  const [voteTarget, setVoteTarget] = useState<Product | null>(null);

  const openProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-white font-bold text-center text-sm tracking-tight">{category}</h4>

      <div className="relative">
        <CardCoverFlow
          products={items}
          onOpen={openProduct}
          onLongPress={setVoteTarget}
        />

        {voteTarget && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex items-center justify-center gap-6 rounded-[24px]">
            <button
              onClick={(e) => { e.stopPropagation(); toggleVote(voteTarget.id, 'yes'); setVoteTarget(null); haptic.trigger('selection'); }}
              aria-label="Vote yes"
              data-cuelume-press
              className={`w-14 h-14 rounded-full border-[1.5px] flex items-center justify-center transition-all pressable ${hasVoted(voteTarget.id) === 'yes'
                ? 'bg-[#4ade80]/20 border-[#4ade80] text-[#4ade80]'
                : 'bg-[#4ade80]/5 border-[#4ade80]/10 text-[#4ade80]/60 hover:bg-[#4ade80]/10'
                }`}
            >
              <HugeiconsIcon icon={ThumbsUpIcon} size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleVote(voteTarget.id, 'no'); setVoteTarget(null); haptic.trigger('selection'); }}
              aria-label="Vote no"
              data-cuelume-press
              className={`w-14 h-14 rounded-full border-[1.5px] flex items-center justify-center transition-all pressable ${hasVoted(voteTarget.id) === 'no'
                ? 'bg-[#FF7575]/20 border-[#FF7575] text-[#FF7575]'
                : 'bg-[#FF7575]/5 border-[#FF7575]/10 text-[#FF7575]/60 hover:bg-[#FF7575]/10'
                }`}
            >
              <HugeiconsIcon icon={ThumbsDownIcon} size={24} />
            </button>
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="inline-flex self-center items-center justify-center min-w-[24px] h-5 px-2.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-[11px] font-bold tabular-nums">
          {items.length}
        </div>
      )}
    </div>
  );
}
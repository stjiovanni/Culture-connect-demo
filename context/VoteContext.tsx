"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type VoteValue = 'yes' | 'no';

interface Vote {
  productId: number;
  value: VoteValue;
}

interface VoteContextType {
  votes: Vote[];
  toggleVote: (productId: number, value: VoteValue) => void;
  hasVoted: (productId: number) => VoteValue | null;
  voteCount: number;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cultureconnect_votes');
    if (saved) {
      try {
        setVotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse votes', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cultureconnect_votes', JSON.stringify(votes));
    }
  }, [votes, isLoaded]);

  const toggleVote = (productId: number, value: VoteValue) => {
    setVotes(prev => {
      const existingIndex = prev.findIndex(v => v.productId === productId);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        if (existing.value === value) {
          // Rescind vote
          return prev.filter(v => v.productId !== productId);
        } else {
          // Change vote
          const next = [...prev];
          next[existingIndex] = { productId, value };
          return next;
        }
      } else {
        // Add new vote
        return [...prev, { productId, value }];
      }
    });
  };

  const hasVoted = (productId: number) => {
    const v = votes.find(v => v.productId === productId);
    return v ? v.value : null;
  };

  return (
    <VoteContext.Provider value={{ votes, toggleVote, hasVoted, voteCount: votes.length }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVotes() {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error('useVotes must be used within a VoteProvider');
  }
  return context;
}

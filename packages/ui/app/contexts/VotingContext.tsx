'use client';

import { createContext, useContext } from 'react';

import type { MarketSide } from '@ui/hooks/veion/useVeIONVote';

interface VotingContextType {
  selectedRows: Record<string, string>;
  onVoteChange: (id: string, side: MarketSide, value: string) => void;
}

export const VotingContext = createContext<VotingContextType | null>(null);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

'use client';

import { createContext, useContext } from 'react';

interface VotingContextType {
  selectedRows: Record<string, string>;
  onVoteChange: (id: string, value: string) => void;
}

export const VotingContext = createContext<VotingContextType | null>(null);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

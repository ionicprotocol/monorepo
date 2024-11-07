import React, { createContext, useState, useCallback } from 'react';

import type { VoteMarket } from '@ui/context/EmissionsManagementContext';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

interface VotingContextType {
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
}

export const VotingContext = createContext<VotingContextType | null>(null);

interface VotingProviderProps {
  children: React.ReactNode;
  markets: Record<string, VoteMarket[]>;
  onVoteAdd: (id: string, side: MarketSide, value: number) => void;
  onVoteRemove: (id: string) => void;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({
  children,
  markets,
  onVoteAdd,
  onVoteRemove
}) => {
  const [votes, setVotes] = useState<Record<string, string>>(() => {
    const initialVotes: Record<string, string> = {};
    Object.values(markets)
      .flat()
      .forEach((market) => {
        if (market.supplyVote) {
          initialVotes[`${market.marketAddress}-supply`] = market.supplyVote;
        }
        if (market.borrowVote) {
          initialVotes[`${market.marketAddress}-borrow`] = market.borrowVote;
        }
      });
    return initialVotes;
  });

  const updateVote = useCallback(
    (marketAddress: string, side: MarketSide, value: string) => {
      const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

      setVotes((prev) => {
        const newVotes = { ...prev };
        if (value === '') {
          delete newVotes[key];
          onVoteRemove(marketAddress);
        } else {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            newVotes[key] = value;
            onVoteAdd(marketAddress, side, numValue);
          }
        }
        return newVotes;
      });
    },
    [onVoteAdd, onVoteRemove]
  );

  const resetVotes = useCallback(() => {
    // Clear all votes
    Object.keys(votes).forEach((key) => {
      const [marketAddress, side] = key.split('-');
      onVoteRemove(marketAddress);
    });
    setVotes({});
  }, [votes, onVoteRemove]);

  return (
    <VotingContext.Provider value={{ votes, updateVote, resetVotes }}>
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = React.useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

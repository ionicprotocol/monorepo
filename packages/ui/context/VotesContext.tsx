import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react';

import { MarketSide } from '@ui/types/veION';

import { useMarketData, MarketDataProvider } from './MarketDataContext';

type VotesContextType = {
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
  refreshVotingData: (nftId: string) => Promise<void>;
};

const VotesContext = createContext<VotesContextType>({
  votes: {},
  updateVote: () => {},
  resetVotes: () => {},
  refreshVotingData: async () => {}
});

export const VotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [votes, setVotes] = useState<Record<string, string>>({});

  const updateVote = useCallback(
    (marketAddress: string, side: MarketSide, value: string) => {
      setVotes((prev) => {
        const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;
        if (value === '' || isNaN(parseFloat(value))) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: value };
      });
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
  }, []);

  const refreshVotingData = async (nftId: string) => {
    // Implementation
  };

  const value = useMemo(
    () => ({
      votes,
      updateVote,
      resetVotes,
      refreshVotingData
    }),
    [votes, updateVote, resetVotes]
  );

  return (
    <VotesContext.Provider value={value}>{children}</VotesContext.Provider>
  );
};

export const useVotes = () => {
  const context = useContext(VotesContext);
  if (!context) {
    throw new Error('useVotes must be used within a VotesProvider');
  }
  return context;
};

export const useTableData = () => {
  const { baseMarketRows, isLoading, error } = useMarketData();
  const { votes } = useVotes();

  const marketRows = useMemo(() => {
    if (isLoading || error) return baseMarketRows;

    return baseMarketRows.map((row) => {
      const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
      return {
        ...row,
        voteValue: votes[key] || ''
      };
    });
  }, [baseMarketRows, votes, isLoading, error]);

  return { marketRows, isLoading, error };
};

// Root provider
export const EmissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <MarketDataProvider>
      <VotesProvider>{children}</VotesProvider>
    </MarketDataProvider>
  );
};

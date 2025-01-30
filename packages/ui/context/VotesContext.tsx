import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';

import { MarketSide } from '@ui/types/veION';

import { useMarketData, MarketDataProvider } from './MarketDataContext';

type VotesContextType = {
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
};

const VotesContext = createContext<VotesContextType>({
  votes: {},
  updateVote: () => {},
  resetVotes: () => {}
});

export const VotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [totalVotes, setTotalVotes] = useState(0);

  // Update total votes whenever votes change
  useEffect(() => {
    const newTotal = Object.values(votes).reduce((sum, value) => {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? sum : sum + numValue;
    }, 0);
    setTotalVotes(newTotal);
  }, [votes]);

  const updateVote = useCallback(
    (marketAddress: string, side: MarketSide, value: string) => {
      setVotes((prev) => {
        const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

        if (value === '' || isNaN(parseFloat(value))) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }

        // Calculate new total excluding current key
        const otherVotesTotal = Object.entries(prev).reduce(
          (sum, [voteKey, voteValue]) => {
            if (voteKey !== key && voteValue) {
              return sum + parseFloat(voteValue);
            }
            return sum;
          },
          0
        );

        const newValue = parseFloat(value);
        if (otherVotesTotal + newValue > 100) {
          // Don't update if it would exceed 100%
          return prev;
        }

        return { ...prev, [key]: value };
      });
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
  }, []);

  const value = useMemo(
    () => ({
      votes,
      updateVote,
      resetVotes,
      totalVotes
    }),
    [votes, updateVote, resetVotes, totalVotes]
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

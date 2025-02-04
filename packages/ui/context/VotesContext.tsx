import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';

import { MarketSide } from '@ui/types/veION';

import { useVeIonVoteContext } from './VeIonVoteContext';

type VotesContextType = {
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
  totalVotes: number;
};

const VotesContext = createContext<VotesContextType>({
  votes: {},
  updateVote: () => {},
  resetVotes: () => {},
  totalVotes: 0
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
      // Use a small epsilon for floating point comparison
      return isNaN(numValue) ? sum : Math.round((sum + numValue) * 100) / 100;
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
        // Round to 2 decimal places to avoid floating point issues
        const roundedTotal =
          Math.round((otherVotesTotal + newValue) * 100) / 100;

        if (roundedTotal > 100) {
          return prev;
        }

        return { ...prev, [key]: value };
      });
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
    setTotalVotes(0);
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

export const useVoteTableData = () => {
  const { selectedPoolRows } = useVeIonVoteContext();
  const { isLoading, error, data } = selectedPoolRows;
  const { votes } = useVotes();

  const marketRows = useMemo(() => {
    if (isLoading || error) return selectedPoolRows;

    return data.map((row) => {
      const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
      return {
        ...row,
        voteValue: votes[key] || ''
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoolRows, votes, isLoading, error]);

  return { marketRows, isLoading, error };
};

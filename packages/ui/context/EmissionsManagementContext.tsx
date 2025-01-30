import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react';
import { useSearchParams } from 'next/navigation';
import { mode } from 'viem/chains';
import { useMarketRows } from '@ui/hooks/veion/useMarketRows';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';

import type { Hex } from 'viem';
import type { FlywheelReward } from '@ionicprotocol/types';

// Keep the type definitions as they are
export type VoteMarketRow = {
  asset: string;
  underlyingToken: Hex;
  side: MarketSide;
  marketAddress: `0x${string}`;
  currentAmount: string;
  incentives: {
    balanceUSD: number;
    tokens: {
      tokenSymbol: string;
      tokenAmount: number;
      tokenAmountUSD: number;
    }[];
  };
  veAPR: string;
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
  voteValue: string;
  apr: {
    supplyAPR?: number;
    borrowAPR?: number;
    supplyRewards?: FlywheelReward[];
    borrowRewards?: FlywheelReward[];
    nativeAssetYield?: number;
    supplyAPRTotal?: number;
    borrowAPRTotal?: number;
    cTokenAddress: `0x${string}`;
    comptrollerAddress: `0x${string}`;
  };
};

type EmissionsContextType = {
  marketRows: VoteMarketRow[];
  isLoading: boolean;
  error: Error | null;
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
  refreshVotingData: (nftId: string) => Promise<void>;
};

const EmissionsContext = createContext<EmissionsContextType>({
  marketRows: [],
  isLoading: false,
  error: null,
  votes: {},
  updateVote: () => {},
  resetVotes: () => {},
  refreshVotingData: async () => {}
});

export const EmissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const { baseMarketRows, isLoading, error } = useMarketRows(
    chain,
    selectedPool
  );
  console.log('baseMarketRows', baseMarketRows);

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

  // Combine the base market rows with votes in a memoized way
  const marketRows = useMemo(() => {
    return baseMarketRows.map((row) => {
      const key = `${row.marketAddress}-${row.side === MarketSide.Supply ? 'supply' : 'borrow'}`;
      return {
        ...row,
        voteValue: votes[key] || ''
      };
    });
  }, [baseMarketRows, votes]);

  const refreshVotingData = async (nftId: string) => {
    // Implementation for refreshing voting data
  };

  const contextValue = useMemo(
    () => ({
      marketRows,
      isLoading,
      error,
      votes,
      updateVote,
      resetVotes,
      refreshVotingData
    }),
    [marketRows, isLoading, error, votes, updateVote, resetVotes]
  );

  return (
    <EmissionsContext.Provider value={contextValue}>
      {children}
    </EmissionsContext.Provider>
  );
};

export const useEmissionsContext = () => {
  const context = useContext(EmissionsContext);
  if (!context) {
    throw new Error(
      'useEmissionsContext must be used within an EmissionsProvider'
    );
  }
  return context;
};

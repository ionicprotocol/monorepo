import React, { createContext, useContext, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';

import { useMarketRows } from '@ui/hooks/veion/useMarketRows';
import type { VotingPeriodInfo } from '@ui/hooks/veion/useVotingPeriod';
import { useVotingPeriod } from '@ui/hooks/veion/useVotingPeriod';
import type { VoteMarketRow } from '@ui/types/veION';

type MarketDataContextType = {
  baseMarketRows: VoteMarketRow[];
  isLoading: boolean;
  error: Error | null;
  votingPeriod: VotingPeriodInfo;
};

const MarketDataContext = createContext<MarketDataContextType>({
  baseMarketRows: [],
  isLoading: false,
  error: null,
  votingPeriod: {
    hasVoted: false,
    nextVotingDate: null,
    currentEpoch: 0,
    lastVoted: null,
    isLoading: false,
    error: null,
    timeRemaining: { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
});

export const MarketDataProvider: React.FC<{
  children: React.ReactNode;
  tokenId?: number;
}> = ({ children, tokenId }) => {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const { baseMarketRows, isLoading, error } = useMarketRows(
    chain,
    selectedPool,
    tokenId
  );

  const votingPeriod = useVotingPeriod(chain, tokenId);

  const value = useMemo(
    () => ({
      baseMarketRows,
      isLoading: isLoading || votingPeriod.isLoading,
      error: error || votingPeriod.error,
      votingPeriod
    }),
    [baseMarketRows, isLoading, error, votingPeriod]
  );

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};

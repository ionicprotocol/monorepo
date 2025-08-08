'use client';

import React, { createContext, useContext, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';

import { useMarketRows } from '@ui/hooks/veion/useMarketRows';
import type { VotingPeriodInfo } from '@ui/hooks/veion/useVotingPeriod';
import { useVotingPeriod } from '@ui/hooks/veion/useVotingPeriod';
import type { VoteMarketRow } from '@ui/types/veION';

type VeIonVoteContextType = {
  allMarketRows: {
    [poolId: string]: {
      data: VoteMarketRow[];
      poolName: string;
    };
  };
  selectedPoolRows: {
    data: VoteMarketRow[];
    isLoading: boolean;
    error: Error | null;
    refetch?: () => Promise<void>;
  };
  votingPeriod: VotingPeriodInfo & {
    refetch?: () => Promise<void>;
  };
};

const VeIonVoteContext = createContext<VeIonVoteContextType>({
  allMarketRows: {},
  selectedPoolRows: {
    data: [],
    isLoading: false,
    error: null,
    refetch: async () => {}
  },
  votingPeriod: {
    hasVoted: false,
    nextVotingDate: null,
    currentEpoch: 0,
    lastVoted: null,
    isLoading: false,
    error: null,
    timeRemaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    refetch: async () => {},
    isVotingClosed: false
  }
});

export const VeIonVoteProvider: React.FC<{
  children: React.ReactNode;
  tokenId?: number;
}> = ({ children, tokenId }) => {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const chain = querychain ? querychain : mode.id.toString();
  const selectedPool = querypool ?? (+chain === mode.id ? '1' : '0');

  const votingPeriod = useVotingPeriod(chain, tokenId);

  const pool0 = useMarketRows(chain, '0', tokenId);
  const pool1 = useMarketRows(chain, '1', tokenId);

  const allMarketRows = useMemo(
    () => ({
      '0': {
        data: pool0.baseMarketRows,
        poolName: 'Pool 0',
        isLoading: pool0.isLoading,
        error: pool0.error,
        refetch: pool0.refetch
      },
      '1': {
        data: pool1.baseMarketRows,
        poolName: 'Pool 1',
        isLoading: pool1.isLoading,
        error: pool1.error,
        refetch: pool1.refetch
      }
    }),
    [pool0, pool1]
  );

  const selectedPoolRows =
    allMarketRows[selectedPool as keyof typeof allMarketRows];

  const value = useMemo(
    () => ({
      allMarketRows,
      selectedPoolRows: {
        data: selectedPoolRows.data,
        isLoading: selectedPoolRows.isLoading,
        error: selectedPoolRows.error,
        refetch: async () => {
          await pool0?.refetch();
          await pool1?.refetch();
        }
      },
      votingPeriod: {
        ...votingPeriod,
        refetch: votingPeriod.refetch
      }
    }),
    [allMarketRows, selectedPoolRows, votingPeriod, pool0, pool1]
  );

  return (
    <VeIonVoteContext.Provider value={value}>
      {children}
    </VeIonVoteContext.Provider>
  );
};

export const useVeIonVoteContext = () => {
  const context = useContext(VeIonVoteContext);
  if (!context) {
    throw new Error('useMarketData must be used within a VeIonVoteProvider');
  }
  return context;
};

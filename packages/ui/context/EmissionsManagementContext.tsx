import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { MarketSide } from '@ui/hooks/veion/useVeIONVote';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useSearchParams } from 'next/navigation';
import { mode } from 'viem/chains';
import { useVeIONContext } from './VeIonContext';

type MarketMetrics = {
  currentMarketAPR: string;
  projectedMarketAPR: string;
  incentives: {
    balance: number;
    balanceUSD: number;
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
};

export type VoteMarketRow = {
  asset: string;
  underlyingToken: string;
  side: MarketSide;
  marketAddress: `0x${string}`;
  currentAmount: string;
  currentMarketAPR: string;
  projectedMarketAPR: string;
  incentives: {
    balance: number;
    balanceUSD: number;
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

export const EmissionsContext = createContext<EmissionsContextType>({
  marketRows: [],
  isLoading: false,
  error: null,
  votes: {},
  updateVote: () => {},
  resetVotes: () => {},
  refreshVotingData: async () => {}
});

export const EmissionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentChain: chainId } = useVeIONContext();
  const [marketRows, setMarketRows] = useState<VoteMarketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    selectedPool,
    +chain
  );

  // Initialize markets and votes whenever poolData changes
  useEffect(() => {
    const initializeMarkets = async () => {
      setIsLoading(true);
      try {
        const assets = poolData?.assets;

        if (assets && assets.length > 0) {
          const rows: VoteMarketRow[] = [];

          assets.forEach((asset) => {
            // Generate some random metrics for demonstration
            const supplyMetrics: MarketMetrics = {
              currentMarketAPR: (Math.random() * 10).toFixed(2) + '%',
              projectedMarketAPR: (Math.random() * 12).toFixed(2) + '%',
              incentives: {
                balance: Math.random() * 1000000,
                balanceUSD: Math.random() * 1000000
              },
              veAPR: (Math.random() * 8).toFixed(2) + '%',
              totalVotes: {
                percentage: (Math.random() * 100).toFixed(2) + '%',
                limit: (Math.random() * 1000000).toFixed(0)
              },
              myVotes: {
                percentage: (Math.random() * 50).toFixed(2) + '%',
                value: (Math.random() * 10000).toFixed(0)
              },
              voteValue: ''
            };

            const borrowMetrics: MarketMetrics = {
              currentMarketAPR: (Math.random() * 15).toFixed(2) + '%',
              projectedMarketAPR: (Math.random() * 18).toFixed(2) + '%',
              incentives: {
                balance: Math.random() * 1000000,
                balanceUSD: Math.random() * 1000000
              },
              veAPR: (Math.random() * 8).toFixed(2) + '%',
              totalVotes: {
                percentage: (Math.random() * 100).toFixed(2) + '%',
                limit: (Math.random() * 1000000).toFixed(0)
              },
              myVotes: {
                percentage: (Math.random() * 50).toFixed(2) + '%',
                value: (Math.random() * 10000).toFixed(0)
              },
              voteValue: ''
            };

            // Add supply row
            rows.push({
              asset: asset.underlyingSymbol,
              underlyingToken: asset.underlyingToken,
              side: MarketSide.Supply,
              marketAddress: asset.cToken as `0x${string}`,
              currentAmount: (Math.random() * 1000000).toFixed(2),
              ...supplyMetrics
            });

            // Add borrow row
            rows.push({
              asset: asset.underlyingSymbol,
              underlyingToken: asset.underlyingToken,
              side: MarketSide.Borrow,
              marketAddress: asset.cToken as `0x${string}`,
              currentAmount: (Math.random() * 1000000).toFixed(2),
              ...borrowMetrics
            });
          });

          setMarketRows(rows);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to initialize markets')
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeMarkets();
  }, [chainId, poolData]);

  const updateVote = useCallback(
    (marketAddress: string, side: MarketSide, value: string) => {
      const key = `${marketAddress}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

      setVotes((prev) => {
        const newVotes = { ...prev };
        if (value === '' || isNaN(parseFloat(value))) {
          delete newVotes[key];
        } else {
          newVotes[key] = value;
        }
        return newVotes;
      });

      setMarketRows((prev) =>
        prev.map((row) => {
          if (row.marketAddress === marketAddress && row.side === side) {
            return {
              ...row,
              voteValue: value
            };
          }
          return row;
        })
      );
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
    setMarketRows((prev) =>
      prev.map((row) => ({
        ...row,
        voteValue: ''
      }))
    );
  }, []);

  const refreshVotingData = async (nftId: string) => {
    // Implementation remains similar but would need to be updated
    // to match the new data structure
  };

  return (
    <EmissionsContext.Provider
      value={{
        marketRows,
        isLoading: isLoading || isLoadingPoolData,
        error,
        votes,
        updateVote,
        resetVotes,
        refreshVotingData
      }}
    >
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

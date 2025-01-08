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

type VotingData = {
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
  autoVote: boolean;
  supplyVote: string;
  borrowVote: string;
};

export type VoteMarket = {
  asset: string;
  marketAddress: `0x${string}`;
  underlyingToken: string;
  poolType: number;
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
  autoVote: boolean;
  supplyVote: string;
  borrowVote: string;
};

type EmissionsContextType = {
  markets: VoteMarket[];
  isLoading: boolean;
  error: Error | null;
  votes: Record<string, string>;
  updateVote: (marketAddress: string, side: MarketSide, value: string) => void;
  resetVotes: () => void;
  refreshVotingData: (nftId: string) => Promise<void>;
};

const defaultVotingData: VotingData = {
  totalVotes: {
    percentage: '0%',
    limit: '0'
  },
  myVotes: {
    percentage: '0%',
    value: '0'
  },
  autoVote: false,
  supplyVote: '',
  borrowVote: ''
};

export const fetchVotingData = async (
  chainId: number,
  nftId: string
): Promise<Record<string, VotingData>> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const mockData: Record<string, VotingData> = {};

  // Mock data generation logic remains the same
  return mockData;
};

export const EmissionsContext = createContext<EmissionsContextType>({
  markets: [],
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
  const [markets, setMarkets] = useState<VoteMarket[]>([]);
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
  console.log('poolData', poolData);

  // Initialize markets and votes whenever poolData changes
  useEffect(() => {
    const initializeMarkets = async () => {
      setIsLoading(true);
      try {
        const assets = poolData?.assets;

        if (assets && assets.length > 0) {
          const votingData = await fetchVotingData(chainId, '0');

          const mappedMarkets = assets.map((asset) => {
            const marketVotingData =
              votingData[asset.cToken] || defaultVotingData;

            return {
              asset: asset.underlyingSymbol,
              marketAddress: asset.cToken as `0x${string}`,
              underlyingToken: asset.underlyingToken,
              poolType: +selectedPool,
              totalVotes: marketVotingData.totalVotes,
              myVotes: marketVotingData.myVotes,
              autoVote: marketVotingData.autoVote,
              supplyVote: marketVotingData.supplyVote,
              borrowVote: marketVotingData.borrowVote
            };
          });

          // Initialize votes
          const initialVotes: Record<string, string> = {};
          mappedMarkets.forEach((market) => {
            if (market.supplyVote) {
              initialVotes[`${market.marketAddress}-supply`] =
                market.supplyVote;
            }
            if (market.borrowVote) {
              initialVotes[`${market.marketAddress}-borrow`] =
                market.borrowVote;
            }
          });

          setVotes(initialVotes);
          setMarkets(mappedMarkets);
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

      // Update the market data
      setMarkets((prev) =>
        prev.map((market) => {
          if (market.marketAddress === marketAddress) {
            return {
              ...market,
              [side === MarketSide.Supply ? 'supplyVote' : 'borrowVote']: value
            };
          }
          return market;
        })
      );
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
    // Reset votes in markets
    setMarkets((prev) =>
      prev.map((market) => ({
        ...market,
        supplyVote: '',
        borrowVote: ''
      }))
    );
  }, []);

  const refreshVotingData = async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const votingData = await fetchVotingData(chainId, nftId);

      setMarkets((currentMarkets) =>
        currentMarkets.map((market) => {
          const marketVotingData =
            votingData[market.marketAddress] || defaultVotingData;
          return {
            ...market,
            ...marketVotingData
          };
        })
      );

      const newVotes: Record<string, string> = {};
      Object.entries(votingData).forEach(([marketAddress, data]) => {
        if (data.supplyVote) {
          newVotes[`${marketAddress}-supply`] = data.supplyVote;
        }
        if (data.borrowVote) {
          newVotes[`${marketAddress}-borrow`] = data.borrowVote;
        }
      });

      setVotes(newVotes);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch voting data')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EmissionsContext.Provider
      value={{
        markets,
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

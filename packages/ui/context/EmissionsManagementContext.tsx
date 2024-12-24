import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { MarketSide } from '@ui/hooks/veion/useVeIONVote';
import { voteMarkets } from '@ui/utils/voteMarkets';

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
  poolType: 0 | 1;
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
  markets: Record<string, VoteMarket[]>;
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

  Object.entries(voteMarkets[chainId] || {}).forEach(([_, markets]) => {
    markets.forEach((market) => {
      mockData[market.marketAddress] = {
        totalVotes: {
          percentage: '25%',
          limit: '100,000'
        },
        myVotes: {
          percentage: '10%',
          value: '10,000'
        },
        autoVote: Math.random() > 0.5,
        supplyVote: (Math.random() * 20).toFixed(1),
        borrowVote: (Math.random() * 20).toFixed(1)
      };
    });
  });

  return mockData;
};

export const EmissionsContext = createContext<EmissionsContextType>({
  markets: {},
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
  const [markets, setMarkets] = useState<Record<string, VoteMarket[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});

  // Initialize markets and votes whenever chainId changes
  useEffect(() => {
    const initializeMarkets = async () => {
      setIsLoading(true);
      try {
        const initialMarkets: Record<string, VoteMarket[]> = {};
        const chainMarkets = voteMarkets[chainId] || {};

        Object.entries(chainMarkets).forEach(([poolType, markets]) => {
          initialMarkets[poolType] = markets.map((market) => ({
            ...market,
            ...defaultVotingData
          }));
        });

        setMarkets(initialMarkets);

        if (Object.keys(chainMarkets).length > 0) {
          const votingData = await fetchVotingData(chainId, '0');

          // Initialize both markets and votes
          setMarkets((currentMarkets) => {
            const updatedMarkets: Record<string, VoteMarket[]> = {};
            const initialVotes: Record<string, string> = {};

            Object.entries(currentMarkets).forEach(([poolType, markets]) => {
              updatedMarkets[poolType] = markets.map((market) => {
                const marketVotingData =
                  votingData[market.marketAddress] || defaultVotingData;

                // Initialize votes
                if (marketVotingData.supplyVote) {
                  initialVotes[`${market.marketAddress}-supply`] =
                    marketVotingData.supplyVote;
                }
                if (marketVotingData.borrowVote) {
                  initialVotes[`${market.marketAddress}-borrow`] =
                    marketVotingData.borrowVote;
                }

                return {
                  ...market,
                  totalVotes: marketVotingData.totalVotes,
                  myVotes: marketVotingData.myVotes,
                  autoVote: marketVotingData.autoVote,
                  supplyVote: marketVotingData.supplyVote,
                  borrowVote: marketVotingData.borrowVote
                };
              });
            });

            setVotes(initialVotes);
            return updatedMarkets;
          });
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
  }, [chainId]);

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

      // Update the market data as well
      setMarkets((prev) => {
        const newMarkets = { ...prev };
        Object.entries(newMarkets).forEach(([poolType, markets]) => {
          newMarkets[poolType] = markets.map((market) => {
            if (market.marketAddress === marketAddress) {
              return {
                ...market,
                [side === MarketSide.Supply ? 'supplyVote' : 'borrowVote']:
                  value
              };
            }
            return market;
          });
        });
        return newMarkets;
      });
    },
    []
  );

  const resetVotes = useCallback(() => {
    setVotes({});
    // Reset votes in markets as well
    setMarkets((prev) => {
      const newMarkets = { ...prev };
      Object.entries(newMarkets).forEach(([poolType, markets]) => {
        newMarkets[poolType] = markets.map((market) => ({
          ...market,
          supplyVote: '',
          borrowVote: ''
        }));
      });
      return newMarkets;
    });
  }, []);

  const refreshVotingData = async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const votingData = await fetchVotingData(chainId, nftId);
      setMarkets((currentMarkets) => {
        const updatedMarkets: Record<string, VoteMarket[]> = {};
        const newVotes: Record<string, string> = {};

        Object.entries(currentMarkets).forEach(([poolType, markets]) => {
          updatedMarkets[poolType] = markets.map((market) => {
            const marketVotingData =
              votingData[market.marketAddress] || defaultVotingData;

            if (marketVotingData.supplyVote) {
              newVotes[`${market.marketAddress}-supply`] =
                marketVotingData.supplyVote;
            }
            if (marketVotingData.borrowVote) {
              newVotes[`${market.marketAddress}-borrow`] =
                marketVotingData.borrowVote;
            }

            return {
              ...market,
              ...marketVotingData
            };
          });
        });

        setVotes(newVotes);
        return updatedMarkets;
      });
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
        isLoading,
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

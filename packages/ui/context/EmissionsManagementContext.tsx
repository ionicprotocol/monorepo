import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Mock response with supply and borrow votes
  const mockData: Record<string, VotingData> = {};

  // Get all markets for the current chain
  Object.entries(voteMarkets[chainId] || {}).forEach(([_, markets]) => {
    markets.forEach((market) => {
      // Generate some mock data for each market
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
        supplyVote: (Math.random() * 20).toFixed(1), // Random value between 0 and 20
        borrowVote: (Math.random() * 20).toFixed(1) // Random value between 0 and 20
      };
    });
  });

  return mockData;
};

type EmissionsContextType = {
  markets: Record<string, VoteMarket[]>;
  isLoading: boolean;
  error: Error | null;
  refreshVotingData: (nftId: string) => Promise<void>;
};

export const EmissionsContext = createContext<EmissionsContextType>({
  markets: {},
  isLoading: false,
  error: null,
  refreshVotingData: async () => {}
});

export const EmissionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [markets, setMarkets] = useState<Record<string, VoteMarket[]>>({});
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<Error | null>(null);
  const { currentChain: chainId } = useVeIONContext();

  // Initialize markets with default values whenever chainId changes
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

        // Immediately fetch initial data if we have markets
        if (Object.keys(chainMarkets).length > 0) {
          const votingData = await fetchVotingData(chainId, '0'); // Default NFT ID

          setMarkets((currentMarkets) => {
            const updatedMarkets: Record<string, VoteMarket[]> = {};
            Object.entries(currentMarkets).forEach(([poolType, markets]) => {
              updatedMarkets[poolType] = markets.map((market) => {
                const marketVotingData =
                  votingData[market.marketAddress] || defaultVotingData;
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

  const refreshVotingData = async (nftId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const votingData = await fetchVotingData(chainId, nftId);

      setMarkets((currentMarkets) => {
        const updatedMarkets: Record<string, VoteMarket[]> = {};

        Object.entries(currentMarkets).forEach(([poolType, markets]) => {
          updatedMarkets[poolType] = markets.map((market) => {
            const marketVotingData =
              votingData[market.marketAddress] || defaultVotingData;
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
      value={{ markets, isLoading, error, refreshVotingData }}
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';

import { FLYWHEEL_TYPE_MAP } from '@ui/constants/index';
import { EXCLUDED_MARKETS } from '@ui/constants/veIon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFraxtalAprs } from '@ui/hooks/useFraxtalApr';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMerklData } from '@ui/hooks/useMerklData';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import { MarketSide } from '@ui/hooks/veion/useVeIONVote';
import { calculateTotalAPR } from '@ui/utils/marketUtils';
import { multipliers } from '@ui/utils/multipliers';

import type { Hex } from 'viem';

import type { FlywheelReward } from '@ionicprotocol/types';

export type VoteMarketRow = {
  asset: string;
  underlyingToken: Hex;
  side: MarketSide;
  marketAddress: `0x${string}`;
  currentAmount: string;
  projectedMarketAPR: string;
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

const mockIncentives = () => {
  // Available token options
  const tokenOptions = [
    { symbol: 'ION', priceRange: [10, 50] },
    { symbol: 'USDC', priceRange: [0.99, 1.01] },
    { symbol: 'FRAX', priceRange: [0.99, 1.01] },
    { symbol: 'ETH', priceRange: [2000, 3000] }
  ];

  // Randomly select 1-3 unique tokens
  const numTokens = Math.floor(Math.random() * 2) + 1; // 1 or 2 tokens
  const selectedTokens = [...tokenOptions]
    .sort(() => Math.random() - 0.5)
    .slice(0, numTokens);

  const tokens = selectedTokens.map((token) => {
    const tokenAmount = Math.random() * 1000;
    const price =
      token.priceRange[0] +
      Math.random() * (token.priceRange[1] - token.priceRange[0]);
    return {
      tokenSymbol: token.symbol,
      tokenAmount,
      tokenAmountUSD: tokenAmount * price
    };
  });

  return {
    balanceUSD: tokens.reduce((sum, token) => sum + token.tokenAmountUSD, 0),
    tokens
  };
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

  // Add APR-related hooks
  const { data: supplyRates, isLoading: isLoadingSupplyApys } = useSupplyAPYs(
    poolData?.assets ?? [],
    +chain
  );
  const { data: borrowRates, isLoading: isLoadingBorrowApys } = useBorrowAPYs(
    poolData?.assets ?? [],
    +chain
  );
  const { data: fraxtalAprs, isLoading: isLoadingFraxtalAprs } = useFraxtalAprs(
    poolData?.assets ?? []
  );
  const { data: rewards, isLoading: isLoadingRewards } = useRewards({
    chainId: +chain,
    poolId: selectedPool
  });
  const { data: merklApr, isLoading: isLoadingMerklData } = useMerklData();

  // Initialize markets and votes whenever poolData changes
  useEffect(() => {
    const initializeMarkets = async () => {
      setIsLoading(true);
      try {
        const assets = poolData?.assets;

        if (assets && assets.length > 0) {
          const rows: VoteMarketRow[] = [];

          assets.forEach((asset) => {
            const supplyRewards = rewards?.[asset.cToken]
              ?.filter((reward) =>
                FLYWHEEL_TYPE_MAP[+chain]?.supply?.includes(
                  (reward as FlywheelReward).flywheel
                )
              )
              .map((reward) => ({
                ...reward,
                apy: (reward.apy ?? 0) * 100
              })) as FlywheelReward[];

            const borrowRewards = rewards?.[asset.cToken]
              ?.filter((reward) =>
                FLYWHEEL_TYPE_MAP[+chain]?.borrow?.includes(
                  (reward as FlywheelReward).flywheel
                )
              )
              .map((reward) => ({
                ...reward,
                apy: (reward.apy ?? 0) * 100
              })) as FlywheelReward[];

            const nativeAssetYield =
              fraxtalAprs?.[asset.cToken]?.nativeAssetYield;
            const config =
              multipliers[+chain]?.[selectedPool]?.[asset.underlyingSymbol];

            const supplyAPRTotal = calculateTotalAPR({
              type: 'supply',
              baseAPR: supplyRates?.[asset.cToken]
                ? supplyRates[asset.cToken] * 100
                : 0,
              rewards: supplyRewards,
              effectiveNativeYield:
                nativeAssetYield !== undefined
                  ? nativeAssetYield * 100
                  : config?.supply?.underlyingAPR,
              merklAprForOP: config?.supply?.op
                ? merklApr?.find(
                    (info) =>
                      info.token?.toLowerCase() ===
                      asset.underlyingToken?.toLowerCase()
                  )?.apr
                : undefined
            });

            const borrowAPRTotal = calculateTotalAPR({
              type: 'borrow',
              baseAPR: borrowRates?.[asset.cToken]
                ? borrowRates[asset.cToken] * 100
                : 0,
              rewards: borrowRewards,
              effectiveNativeYield:
                nativeAssetYield !== undefined
                  ? nativeAssetYield * 100
                  : config?.borrow?.underlyingAPR,
              merklAprForOP: config?.borrow?.op
                ? merklApr?.find(
                    (info) =>
                      info.token?.toLowerCase() ===
                      asset.underlyingToken?.toLowerCase()
                  )?.apr
                : undefined
            });

            if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.supply) {
              rows.push({
                asset: asset.underlyingSymbol,
                underlyingToken: asset.underlyingToken,
                side: MarketSide.Supply,
                marketAddress: asset.cToken as `0x${string}`,
                currentAmount: (Math.random() * 1000000).toFixed(2),
                projectedMarketAPR: (Math.random() * 12).toFixed(2) + '%',
                incentives: mockIncentives(),
                veAPR: (Math.random() * 8).toFixed(2) + '%',
                totalVotes: {
                  percentage: (Math.random() * 100).toFixed(2) + '%',
                  limit: (Math.random() * 1000000).toFixed(0)
                },
                myVotes: {
                  percentage: (Math.random() * 50).toFixed(2) + '%',
                  value: (Math.random() * 10000).toFixed(0)
                },
                voteValue: '',
                apr: {
                  supplyAPR: supplyRates?.[asset.cToken]
                    ? supplyRates[asset.cToken] * 100
                    : 0,
                  supplyRewards,
                  nativeAssetYield,
                  supplyAPRTotal,
                  cTokenAddress: asset.cToken as `0x${string}`,
                  comptrollerAddress: poolData.comptroller as `0x${string}`
                }
              });
            }

            if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.borrow) {
              rows.push({
                asset: asset.underlyingSymbol,
                underlyingToken: asset.underlyingToken,
                side: MarketSide.Borrow,
                marketAddress: asset.cToken as `0x${string}`,
                currentAmount: (Math.random() * 1000000).toFixed(2),
                projectedMarketAPR: (Math.random() * 18).toFixed(2) + '%',
                incentives: mockIncentives(),
                veAPR: (Math.random() * 8).toFixed(2) + '%',
                totalVotes: {
                  percentage: (Math.random() * 100).toFixed(2) + '%',
                  limit: (Math.random() * 1000000).toFixed(0)
                },
                myVotes: {
                  percentage: (Math.random() * 50).toFixed(2) + '%',
                  value: (Math.random() * 10000).toFixed(0)
                },
                voteValue: '',
                apr: {
                  borrowAPR: borrowRates?.[asset.cToken]
                    ? borrowRates[asset.cToken] * 100
                    : 0,
                  borrowRewards,
                  nativeAssetYield,
                  borrowAPRTotal,
                  cTokenAddress: asset.cToken as `0x${string}`,
                  comptrollerAddress: poolData.comptroller as `0x${string}`
                }
              });
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    poolData?.comptroller,
    supplyRates,
    borrowRates,
    rewards,
    isLoadingFraxtalAprs,
    selectedPool
  ]);

  const updateVote = useCallback(
    (marketAddress: string, side: MarketSide, value: string) => {
      const key = `${marketAddress}-${
        side === MarketSide.Supply ? 'supply' : 'borrow'
      }`;

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
        isLoading:
          isLoading ||
          isLoadingPoolData ||
          isLoadingSupplyApys ||
          isLoadingBorrowApys ||
          isLoadingFraxtalAprs ||
          isLoadingRewards ||
          isLoadingMerklData,
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

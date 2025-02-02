import { useEffect, useState, useMemo, useCallback } from 'react';

import { FLYWHEEL_TYPE_MAP } from '@ui/constants';
import { EXCLUDED_MARKETS } from '@ui/constants/veIon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFraxtalAprs } from '@ui/hooks/useFraxtalApr';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMerklData } from '@ui/hooks/useMerklData';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { VoteMarketRow } from '@ui/types/veION';
import { MarketSide } from '@ui/types/veION';
import { calculateTotalAPR } from '@ui/utils/marketUtils';
import { multipliers } from '@ui/utils/multipliers';

import { useVoteData } from './useVoteData';

import type { FlywheelReward } from '@ionicprotocol/types';

export const useMarketRows = (
  chain: number | string,
  selectedPool: string,
  tokenId?: number
) => {
  const mockIncentives = useMemo(() => {
    const tokenOptions = [
      { symbol: 'ION', priceRange: [10, 50] },
      { symbol: 'USDC', priceRange: [0.99, 1.01] },
      { symbol: 'FRAX', priceRange: [0.99, 1.01] },
      { symbol: 'ETH', priceRange: [2000, 3000] }
    ];

    const numTokens = Math.floor(Math.random() * 2) + 1;
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
  }, []);

  const [baseMarketRows, setBaseMarketRows] = useState<VoteMarketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    selectedPool,
    +chain
  );

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

  const { marketAddresses, marketSides } = useMemo(() => {
    if (!poolData?.assets) return { marketAddresses: [], marketSides: [] };

    const addresses: `0x${string}`[] = [];
    const sides: MarketSide[] = [];
    const tokens: `0x${string}`[] = [];

    poolData.assets.forEach((asset) => {
      if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.supply) {
        addresses.push(asset.cToken as `0x${string}`);
        sides.push(MarketSide.Supply);
        tokens.push(asset.underlyingToken as `0x${string}`);
      }
      if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.borrow) {
        addresses.push(asset.cToken as `0x${string}`);
        sides.push(MarketSide.Borrow);
        tokens.push(asset.underlyingToken as `0x${string}`);
      }
    });

    return { marketAddresses: addresses, marketSides: sides, lpTokens: tokens };
  }, [chain, poolData?.assets]);

  const { voteData, isLoading: isLoadingVoteData } = useVoteData({
    tokenId,
    chain: +chain,
    marketAddresses,
    marketSides
  });

  const processMarketRows = useCallback(() => {
    if (!poolData?.assets || poolData.assets.length === 0) return [];

    return poolData.assets.reduce<VoteMarketRow[]>((rows, asset) => {
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

      const nativeAssetYield = fraxtalAprs?.[asset.cToken]?.nativeAssetYield;
      const config =
        multipliers[+chain]?.[selectedPool]?.[asset.underlyingSymbol];

      const newRows: VoteMarketRow[] = [];

      if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.supply) {
        const key = `${asset.cToken}-supply`;

        newRows.push({
          asset: asset.underlyingSymbol,
          underlyingToken: asset.underlyingToken,
          side: MarketSide.Supply,
          marketAddress: asset.cToken as `0x${string}`,
          currentAmount: asset.totalSupplyFiat.toFixed(2),
          incentives: mockIncentives,
          veAPR: (0).toFixed(2) + '%',
          totalVotes: voteData[key]?.totalVotes ?? {
            percentage: '0.00%',
            limit: '0'
          },
          myVotes: voteData[key]?.myVotes ?? {
            percentage: '0.00%',
            value: '0'
          },
          voteValue: '',
          apr: {
            supplyAPR: supplyRates?.[asset.cToken]
              ? supplyRates[asset.cToken] * 100
              : 0,
            supplyRewards,
            nativeAssetYield,
            supplyAPRTotal: calculateTotalAPR({
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
            }),
            cTokenAddress: asset.cToken as `0x${string}`,
            comptrollerAddress: poolData.comptroller as `0x${string}`
          }
        });
      }

      if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.borrow) {
        const key = `${asset.cToken}-borrow`;

        newRows.push({
          asset: asset.underlyingSymbol,
          underlyingToken: asset.underlyingToken,
          side: MarketSide.Borrow,
          marketAddress: asset.cToken as `0x${string}`,
          currentAmount: asset.totalBorrowFiat.toFixed(2),
          incentives: mockIncentives,
          veAPR: (0).toFixed(2) + '%',
          totalVotes: voteData[key]?.totalVotes ?? {
            percentage: '0.00%',
            limit: '0'
          },
          myVotes: voteData[key]?.myVotes ?? {
            percentage: '0.00%',
            value: '0'
          },
          voteValue: '',
          apr: {
            borrowAPR: borrowRates?.[asset.cToken]
              ? borrowRates[asset.cToken] * 100
              : 0,
            borrowRewards,
            nativeAssetYield,
            borrowAPRTotal: calculateTotalAPR({
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
            }),
            cTokenAddress: asset.cToken as `0x${string}`,
            comptrollerAddress: poolData.comptroller as `0x${string}`
          }
        });
      }

      return [...rows, ...newRows];
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, selectedPool, supplyRates, borrowRates, rewards, merklApr]);

  useEffect(() => {
    if (
      !isLoadingPoolData &&
      !isLoadingSupplyApys &&
      !isLoadingBorrowApys &&
      !isLoadingFraxtalAprs &&
      !isLoadingRewards &&
      !isLoadingVoteData &&
      !isLoadingMerklData
    ) {
      try {
        const rows = processMarketRows();
        setBaseMarketRows(rows);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to initialize markets')
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [
    isLoadingPoolData,
    isLoadingSupplyApys,
    isLoadingBorrowApys,
    isLoadingFraxtalAprs,
    isLoadingRewards,
    isLoadingMerklData,
    isLoadingVoteData,
    processMarketRows
  ]);

  return {
    baseMarketRows,
    isLoading:
      isLoadingPoolData ||
      isLoadingSupplyApys ||
      isLoadingBorrowApys ||
      isLoadingFraxtalAprs ||
      isLoadingRewards ||
      isLoadingVoteData ||
      isLoadingMerklData,
    error
  };
};

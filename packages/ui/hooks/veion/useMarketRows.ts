import { useEffect, useState, useMemo, useCallback } from 'react';

import { EXCLUDED_MARKETS } from '@ui/constants/veIon';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useMerklData } from '@ui/hooks/useMerklData';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import { useMarketIncentives } from '@ui/hooks/veion/useMarketIncentives';
import type { VoteMarketRow } from '@ui/types/veION';
import { MarketSide } from '@ui/types/veION';
import { calculateTotalAPR } from '@ui/utils/marketUtils';

import { useVoteData } from './useVoteData';

export const useMarketRows = (
  chain: number | string,
  selectedPool: string,
  tokenId?: number
) => {
  const [baseMarketRows, setBaseMarketRows] = useState<VoteMarketRow[]>([]);
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

  // Use the new market incentives hook for fetching incentives
  const {
    incentivesData,
    rewardTokensInfo,
    marketTokensDetails, // Add this to access token details
    isLoading: isLoadingIncentives
  } = useMarketIncentives(+chain, marketAddresses, '', undefined);

  const {
    voteData,
    isLoading: isLoadingVoteData,
    refresh: refreshVoteData
  } = useVoteData({
    tokenId,
    chain: +chain,
    marketAddresses,
    marketSides
  });

  const getIncentivesFromBribes = useCallback(
    (marketAddress: string, side: MarketSide) => {
      const normalizedAddress = marketAddress.toLowerCase();
      const sideStr = side === MarketSide.Supply ? 'supply' : 'borrow';

      // Get incentive amount from the incentivesData
      const incentiveAmount = incentivesData[normalizedAddress]?.[sideStr] || 0;

      // Get detailed token info for this market/side from our enhanced marketTokensDetails
      const tokenDetails =
        marketTokensDetails[normalizedAddress]?.[sideStr] || [];

      // Transform token details to the format expected by BalanceBreakdown
      const tokens = tokenDetails.map((tokenDetail) => {
        const formattedAmount = Number(tokenDetail.formattedAmount);
        const tokenAmountUSD = formattedAmount * (tokenDetail.price || 0);

        return {
          tokenSymbol: tokenDetail.symbol,
          tokenAmount: formattedAmount,
          tokenAmountUSD
        };
      });

      return {
        incentiveAmount,
        tokens: tokens.length > 0 ? tokens : []
      };
    },
    [incentivesData, marketTokensDetails]
  );

  const processMarketRows = useCallback(() => {
    if (!poolData?.assets || poolData.assets.length === 0) return [];

    return poolData.assets.reduce<VoteMarketRow[]>((rows, asset) => {
      const newRows: VoteMarketRow[] = [];

      if (!EXCLUDED_MARKETS[+chain]?.[asset.underlyingSymbol]?.supply) {
        const key = `${asset.cToken}-supply`;

        newRows.push({
          asset: asset.underlyingSymbol,
          underlyingToken: asset.underlyingToken,
          side: MarketSide.Supply,
          marketAddress: asset.cToken as `0x${string}`,
          currentAmount: asset.totalSupplyFiat.toFixed(2),
          incentives: getIncentivesFromBribes(asset.cToken, MarketSide.Supply),
          veAPR: 0,
          totalVotes: voteData[key]?.totalVotes ?? {
            percentage: 0,
            limit: 0
          },
          myVotes: voteData[key]?.myVotes ?? {
            percentage: 0,
            value: 0
          },
          voteValue: '',
          apr: {
            supplyAPR: supplyRates?.[asset.cToken]
              ? supplyRates[asset.cToken] * 100
              : 0,
            supplyAPRTotal: calculateTotalAPR({
              type: 'supply',
              baseAPR: supplyRates?.[asset.cToken]
                ? supplyRates[asset.cToken] * 100
                : 0
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
          incentives: getIncentivesFromBribes(asset.cToken, MarketSide.Borrow),
          veAPR: 0,
          totalVotes: voteData[key]?.totalVotes ?? {
            percentage: 0,
            limit: 0
          },
          myVotes: voteData[key]?.myVotes ?? {
            percentage: 0,
            value: 0
          },
          voteValue: '',
          apr: {
            borrowAPR: borrowRates?.[asset.cToken]
              ? borrowRates[asset.cToken] * 100
              : 0,
            borrowAPRTotal: calculateTotalAPR({
              type: 'borrow',
              baseAPR: borrowRates?.[asset.cToken]
                ? borrowRates[asset.cToken] * 100
                : 0
            }),
            cTokenAddress: asset.cToken as `0x${string}`,
            comptrollerAddress: poolData.comptroller as `0x${string}`
          }
        });
      }

      return [...rows, ...newRows];
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chain,
    selectedPool,
    supplyRates,
    borrowRates,
    rewards,
    merklApr,
    voteData
  ]);

  useEffect(() => {
    if (
      !isLoadingPoolData &&
      !isLoadingSupplyApys &&
      !isLoadingBorrowApys &&
      !isLoadingRewards &&
      !isLoadingMerklData &&
      !isLoadingIncentives
    ) {
      try {
        const rows = processMarketRows();
        setBaseMarketRows(rows);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to initialize markets')
        );
      }
    }
  }, [
    isLoadingPoolData,
    isLoadingSupplyApys,
    isLoadingBorrowApys,
    isLoadingRewards,
    isLoadingMerklData,
    isLoadingVoteData,
    isLoadingIncentives,
    processMarketRows
  ]);

  const refetch = useCallback(async () => {
    await refreshVoteData();
  }, [refreshVoteData]);

  return {
    baseMarketRows,
    isLoading:
      isLoadingPoolData ||
      isLoadingSupplyApys ||
      isLoadingBorrowApys ||
      isLoadingRewards ||
      isLoadingVoteData ||
      isLoadingMerklData ||
      isLoadingIncentives,
    error,
    refetch
  };
};

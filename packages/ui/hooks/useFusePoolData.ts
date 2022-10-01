import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useCgId } from '@ui/hooks/useChainConfig';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string, poolChainId: number) => {
  const { address, getSdk } = useMultiMidas();
  const sdk = useMemo(() => getSdk(poolChainId), [getSdk, poolChainId]);
  const coingeckoId = useCgId(poolChainId);
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  return useQuery<PoolData | undefined>(
    ['useFusePoolData', poolId, address || '', sdk?.chainId || ''],
    async () => {
      if (!usdPrice || !sdk) return;
      const response = await sdk.fetchFusePoolData(poolId, { from: address });
      const assetsWithPrice: MarketData[] = [];
      const { underlyingTokens, assets } = response;

      if (assets && assets.length !== 0) {
        assets.map((asset) => {
          assetsWithPrice.push({
            ...asset,
            supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
            borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
            totalSupplyFiat: asset.totalSupplyNative * usdPrice,
            totalBorrowFiat: asset.totalBorrowNative * usdPrice,
            liquidityFiat: asset.liquidityNative * usdPrice,
          });
        });
      }
      const adaptedFusePoolData: PoolData = {
        ...response,
        underlyingTokens,
        assets: assetsWithPrice,
        totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
        totalAvailableLiquidityFiat: response.totalAvailableLiquidityNative * usdPrice,
        totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
        totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
        totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice,
        totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
      };

      return adaptedFusePoolData;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolId && !!usdPrice && !!sdk,
    }
  );
};

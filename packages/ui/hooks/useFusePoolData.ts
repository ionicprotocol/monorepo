import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string, poolChainId: number) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && poolChainId && usdPrices[poolChainId.toString()]) {
      return usdPrices[poolChainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, poolChainId]);

  return useQuery(
    ['useFusePoolData', poolId, address, sdk?.chainId, usdPrice],
    async () => {
      if (usdPrice && sdk?.chainId && poolId) {
        const response = await sdk.fetchFusePoolData(poolId, { from: address });
        if (response === null) {
          return null;
        }
        const assetsWithPrice: MarketData[] = [];
        const { assets } = response;

        if (assets && assets.length !== 0) {
          assets.map((asset) => {
            assetsWithPrice.push({
              ...asset,
              borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
              liquidityFiat: asset.liquidityNative * usdPrice,
              netSupplyBalanceFiat: asset.netSupplyBalanceNative * usdPrice,
              supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
              totalBorrowFiat: asset.totalBorrowNative * usdPrice,
              totalSupplyFiat: asset.totalSupplyNative * usdPrice,
            });
          });
        }
        const adaptedFusePoolData: PoolData = {
          ...response,
          assets: assetsWithPrice.sort((a, b) =>
            a.underlyingSymbol.localeCompare(b.underlyingSymbol)
          ),
          totalAvailableLiquidityFiat: response.totalAvailableLiquidityNative * usdPrice,
          totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
          totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
          totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
          totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
          totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice,
        };

        return adaptedFusePoolData;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!poolId && !!usdPrice && !!sdk,
      staleTime: Infinity,
    }
  );
};

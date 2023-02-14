import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string, poolChainId: number) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[poolChainId.toString()]) {
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
          assets: assetsWithPrice.sort((a, b) =>
            a.underlyingSymbol.localeCompare(b.underlyingSymbol)
          ),
          totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
          totalAvailableLiquidityFiat: response.totalAvailableLiquidityNative * usdPrice,
          totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
          totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
          totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice,
          totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
        };

        return adaptedFusePoolData;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolId && !!usdPrice && !!sdk?.chainId && !!poolChainId,
    }
  );
};

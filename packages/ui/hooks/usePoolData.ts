import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const usePoolData = (poolId?: string, poolChainId?: number) => {
  const { address } = useMultiIonic();
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
    ['usePoolData', poolId, address, sdk?.chainId, usdPrice],
    async () => {
      if (usdPrice && sdk?.chainId && poolId) {
        const response = await sdk.fetchPoolData(poolId, { from: address }).catch((e) => {
          console.warn(`Getting ionic pool data error: `, { address, poolChainId, poolId }, e);

          return null;
        });
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
        const adaptedPoolData: PoolData = {
          ...response,
          assets: assetsWithPrice.sort((a, b) =>
            a.underlyingSymbol.localeCompare(b.underlyingSymbol)
          ),
          totalAvailableLiquidityFiat: response.totalAvailableLiquidityNative * usdPrice,
          totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
          totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
          totalCollateralSupplyBalanceFiat: response.totalCollateralSupplyBalanceNative * usdPrice,
          totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
          totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
          totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice,
        };

        return adaptedPoolData;
      } else {
        return null;
      }
    },
    {
      enabled: !!poolId && !!poolChainId && !!usdPrice && !!sdk,
    }
  );
};

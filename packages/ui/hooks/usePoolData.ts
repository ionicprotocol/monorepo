import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

import { useUsdPrice } from './useUsdPrices';

export const usePoolData = (poolId?: string, poolChainId?: number) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);
  const { data: usdPrice } = useUsdPrice(poolChainId);

  return useQuery({
    queryKey: ['usePoolData', poolId, address, sdk?.chainId, usdPrice],

    queryFn: async () => {
      if (usdPrice && sdk?.chainId && poolId) {
        const response = await sdk.fetchPoolData(poolId).catch((e) => {
          console.warn(
            `Getting ionic pool data error: `,
            { address, poolChainId, poolId },
            e
          );

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
              totalSupplyFiat: asset.totalSupplyNative * usdPrice
            });
          });
        }
        const adaptedPoolData: PoolData = {
          ...response,
          assets: assetsWithPrice.sort((a, b) =>
            a.underlyingSymbol.localeCompare(b.underlyingSymbol)
          ),
          totalAvailableLiquidityFiat:
            response.totalAvailableLiquidityNative * usdPrice,
          totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
          totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
          // totalCollateralSupplyBalanceFiat:
          //   response.totalCollateralSupplyBalanceNative * usdPrice,
          totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
          totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
          totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice
        };

        return adaptedPoolData;
      } else {
        return null;
      }
    },

    enabled: !!poolId && !!poolChainId && !!usdPrice && !!sdk
  });
};

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';

const assetsSortingOrder = [
  'wrsETH',
  'ezETH',
  'weETH.mode',
  'STONE',
  'M-BTC',
  'WETH',
  'WBTC',
  'USDC',
  'USDT',
  'weETH'
];

export const useFusePoolData = (
  poolId: string,
  poolChainId: number,
  excludeNonBorrowable?: boolean
) => {
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

  return useQuery({
    queryKey: [
      'useFusePoolData',
      poolId,
      address,
      sdk?.chainId,
      usdPrice,
      excludeNonBorrowable
    ],

    queryFn: async () => {
      if (usdPrice && sdk?.chainId && poolId) {
        const response = await sdk.fetchPoolData(poolId).catch((e) => {
          console.warn(
            `Getting fuse pool data error: `,
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
        const excludedAssetsIndexes: number[] = [];

        if (assets && assets.length !== 0) {
          const unsortedAssets: MarketData[] = [];

          assets.map((asset) => {
            const indexOfAssetInSort = assetsSortingOrder.findIndex(
              (symbol) => symbol === asset.underlyingSymbol
            );

            if (indexOfAssetInSort === -1) {
              unsortedAssets.push({
                ...asset,
                borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
                liquidityFiat: asset.liquidityNative * usdPrice,
                netSupplyBalanceFiat: asset.netSupplyBalanceNative * usdPrice,
                supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
                totalBorrowFiat: asset.totalBorrowNative * usdPrice,
                totalSupplyFiat: asset.totalSupplyNative * usdPrice
              });

              return;
            }

            assetsWithPrice[indexOfAssetInSort] = {
              ...asset,
              borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
              liquidityFiat: asset.liquidityNative * usdPrice,
              netSupplyBalanceFiat: asset.netSupplyBalanceNative * usdPrice,
              supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
              totalBorrowFiat: asset.totalBorrowNative * usdPrice,
              totalSupplyFiat: asset.totalSupplyNative * usdPrice
            };
          });

          assetsWithPrice.push(...unsortedAssets);
        }

        const adaptedFusePoolData: PoolData = {
          ...response,
          assets: assetsWithPrice.filter((asset) => !!asset),
          totalAvailableLiquidityFiat:
            response.totalAvailableLiquidityNative * usdPrice,
          totalBorrowBalanceFiat: response.totalBorrowBalanceNative * usdPrice,
          totalBorrowedFiat: response.totalBorrowedNative * usdPrice,
          totalLiquidityFiat: response.totalLiquidityNative * usdPrice,
          totalSuppliedFiat: response.totalSuppliedNative * usdPrice,
          totalSupplyBalanceFiat: response.totalSupplyBalanceNative * usdPrice,
          underlyingSymbols: excludeNonBorrowable
            ? response.underlyingSymbols.filter(
                (_, i) => excludedAssetsIndexes.indexOf(i) === -1
              )
            : response.underlyingSymbols,
          underlyingTokens: excludeNonBorrowable
            ? response.underlyingTokens.filter(
                (_, i) => excludedAssetsIndexes.indexOf(i) === -1
              )
            : response.underlyingTokens
        };

        return adaptedFusePoolData;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!poolId && !!usdPrice && !!sdk,
    staleTime: Infinity
  });
};

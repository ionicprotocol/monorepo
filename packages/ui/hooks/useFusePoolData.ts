// useFusePoolData.ts
import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

import { useUsdPrice } from './useUsdPrices';

export const useFusePoolData = (
  poolId: string,
  poolChainId: number,
  excludeNonBorrowable?: boolean
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  const { data: usdPrice } = useUsdPrice(poolChainId);

  const queryKey = useMemo(
    () => [
      'useFusePoolData',
      poolId,
      address,
      sdk?.chainId,
      usdPrice,
      excludeNonBorrowable
    ],
    [poolId, address, sdk?.chainId, usdPrice, excludeNonBorrowable]
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!usdPrice || !sdk?.chainId || typeof poolId === 'undefined') {
        return null;
      }

      const response = await sdk.fetchPoolData(poolId, address).catch((e) => {
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

      const { assets } = response;
      const excludedAssetsIndexes: number[] = [];

      const assetsWithPrice =
        assets?.map((asset) => ({
          ...asset,
          borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
          liquidityFiat: asset.liquidityNative * usdPrice,
          netSupplyBalanceFiat: asset.netSupplyBalanceNative * usdPrice,
          supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
          totalBorrowFiat: asset.totalBorrowNative * usdPrice,
          totalSupplyFiat: asset.totalSupplyNative * usdPrice
        })) ?? [];

      return {
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
    },
    enabled: !!poolId && !!usdPrice && !!sdk
  });
};

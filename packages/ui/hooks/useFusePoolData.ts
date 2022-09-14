import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string) => {
  const { midasSdk, address, coingeckoId, currentChain } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery<PoolData | undefined>(
    ['useFusePoolData', currentChain.id, poolId, address],
    async () => {
      if (!usdPrice) return;

      const response = await midasSdk.fetchFusePoolData(poolId, { from: address });
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
      enabled: !!poolId && !!usdPrice && !!address && !!currentChain.id,
    }
  );
};

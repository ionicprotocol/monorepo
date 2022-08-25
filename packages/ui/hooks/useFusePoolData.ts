import { useQuery } from 'react-query';

import { config } from '@ui/config/index';
import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string) => {
  const { midasSdk, address, coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery<PoolData | null>(
    ['useFusePoolData', poolId, address, usdPrice],
    async () => {
      if (!usdPrice) return null;

      const res = await midasSdk.fetchFusePoolData(poolId, { from: address });
      const assetsWithPrice: MarketData[] = [];
      const assets = res.assets.filter(
        (asset) => !config.hideAssets.includes(asset.underlyingToken.toLowerCase())
      );
      const underlyingTokens = res.underlyingTokens.filter(
        (token) => !config.hideAssets.includes(token.toLowerCase())
      );
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
        ...res,
        underlyingTokens,
        assets: assetsWithPrice,
        totalLiquidityFiat: res.totalLiquidityNative * usdPrice,
        totalAvailableLiquidityFiat: res.totalAvailableLiquidityNative * usdPrice,
        totalSuppliedFiat: res.totalSuppliedNative * usdPrice,
        totalBorrowedFiat: res.totalBorrowedNative * usdPrice,
        totalSupplyBalanceFiat: res.totalSupplyBalanceNative * usdPrice,
        totalBorrowBalanceFiat: res.totalBorrowBalanceNative * usdPrice,
      };

      return adaptedFusePoolData;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!poolId && !!usdPrice && !!address }
  );
};

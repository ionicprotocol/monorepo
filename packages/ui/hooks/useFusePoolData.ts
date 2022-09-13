import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';
import { useSupportedUnderlyings } from '@ui/hooks/useSupportedAssets';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';

export const useFusePoolData = (poolId: string) => {
  const { midasSdk, address, coingeckoId, currentChain } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);
  const { data: supportedUnderlyings } = useSupportedUnderlyings();

  return useQuery<PoolData | undefined>(
    ['useFusePoolData', poolId, address, currentChain.id],
    async () => {
      if (!usdPrice) return;

      const res = await midasSdk.fetchFusePoolData(poolId, { from: address });
      const assetsWithPrice: MarketData[] = [];
      const assets = res.assets.filter((asset) =>
        supportedUnderlyings?.includes(asset.underlyingToken)
      );
      const underlyingTokens = res.underlyingTokens.filter((token) =>
        supportedUnderlyings?.includes(token)
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
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolId && !!usdPrice && !!address && !!supportedUnderlyings && !!currentChain.id,
    }
  );
};

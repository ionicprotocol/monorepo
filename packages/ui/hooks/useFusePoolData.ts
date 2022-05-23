import { FusePoolData, NativePricedFuseAsset } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export const useFusePoolData = (poolId: string) => {
  const { fuse, currentChain, address, coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery<FusePoolData | null>(
    ['useFusePoolData', currentChain.id, poolId, address, usdPrice],
    async () => {
      if (!usdPrice) return null;

      const res = await fuse.fetchFusePoolData(poolId, address);
      const assetsWithPrice: NativePricedFuseAsset[] = [];
      if (res.assets && res.assets.length !== 0) {
        res.assets.map((asset) => {
          assetsWithPrice.push({
            ...asset,
            supplyBalanceNative: asset.supplyBalanceNative * usdPrice,
            borrowBalanceNative: asset.borrowBalanceNative * usdPrice,
            totalSupplyNative: asset.totalSupplyNative * usdPrice,
            totalBorrowNative: asset.totalBorrowNative * usdPrice,
            liquidityNative: asset.liquidityNative * usdPrice,
          });
        });
      }

      return {
        ...res,
        assets: assetsWithPrice,
        totalLiquidityNative: res.totalLiquidityNative * usdPrice,
        totalSuppliedNative: res.totalSuppliedNative * usdPrice,
        totalBorrowedNative: res.totalBorrowedNative * usdPrice,
        totalSupplyBalanceNative: res.totalSupplyBalanceNative * usdPrice,
        totalBorrowBalanceNative: res.totalBorrowBalanceNative * usdPrice,
      } as FusePoolData;
    },
    { enabled: !!usdPrice }
  );
};

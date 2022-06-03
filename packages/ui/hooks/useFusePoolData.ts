import { NativePricedFuseAsset, FusePoolData as SDKFusePoolData } from '@midas-capital/sdk';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';

export interface Market extends NativePricedFuseAsset {
  supplyBalanceFiat: number;
  borrowBalanceFiat: number;
  totalSupplyFiat: number;
  totalBorrowFiat: number;
  liquidityFiat: number;
}

export interface Pool extends SDKFusePoolData {
  assets: Market[];
  totalLiquidityFiat: number;
  totalSuppliedFiat: number;
  totalBorrowedFiat: number;
  totalSupplyBalanceFiat: number;
  totalBorrowBalanceFiat: number;
}

export const useFusePoolData = (poolId: string) => {
  const { fuse, currentChain, address, coingeckoId } = useRari();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  return useQuery<Pool | null>(
    ['useFusePoolData', currentChain.id, poolId, address, usdPrice],
    async () => {
      if (!usdPrice) return null;

      const res = await fuse.fetchFusePoolData(poolId, address);
      const assetsWithPrice: Market[] = [];
      if (res.assets && res.assets.length !== 0) {
        res.assets.map((asset) => {
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
      const adaptedFusePoolData: FusePoolData = {
        ...res,
        assets: assetsWithPrice,
        totalLiquidityFiat: res.totalLiquidityNative * usdPrice,
        totalSuppliedFiat: res.totalSuppliedNative * usdPrice,
        totalBorrowedFiat: res.totalBorrowedNative * usdPrice,
        totalSupplyBalanceFiat: res.totalSupplyBalanceNative * usdPrice,
        totalBorrowBalanceFiat: res.totalBorrowBalanceNative * usdPrice,
      };

      return adaptedFusePoolData;
    },
    { enabled: !!usdPrice }
  );
};

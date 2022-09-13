import { FundOperationMode } from '@midas-capital/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';

import { useMidas } from '@ui/context/MidasContext';
import { useUSDPrice } from '@ui/hooks/useUSDPrice';
import { MarketData } from '@ui/types/TokensDataMap';

// TODO Write proper tests and fix `Native` naming issue for values in Fiat USD.
interface UseUpdatedUserAssetsResult<T> {
  mode: FundOperationMode;
  assets: Array<T> | undefined;
  index: number;
  amount: BigNumber;
}
const useUpdatedUserAssets = <T extends MarketData>({
  mode,
  index,
  assets,
  amount,
}: UseUpdatedUserAssetsResult<T>) => {
  const { midasSdk, currentChain, coingeckoId } = useMidas();
  const { data: usdPrice } = useUSDPrice(coingeckoId);

  const { data: updatedAssets }: UseQueryResult<MarketData[]> = useQuery(
    [
      'useUpdatedUserAssets',
      currentChain.id,
      mode,
      index,
      assets?.map((a) => a.cToken),
      amount,
      usdPrice,
    ],
    async () => {
      if (!assets || !assets.length || !usdPrice) return [];

      const resAssets = await midasSdk.getUpdatedAssets(mode, index, assets, amount);
      const assetsWithPrice: MarketData[] = [];
      if (resAssets && resAssets.length !== 0) {
        resAssets.map((asset) => {
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

      return assetsWithPrice;
    }
  );

  return useMemo(() => updatedAssets, [updatedAssets]);
};

export default useUpdatedUserAssets;

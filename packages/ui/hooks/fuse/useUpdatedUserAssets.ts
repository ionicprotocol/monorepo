import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useUsdPrice } from '../useUsdPrices';

import type { FundOperationMode } from '@ionicprotocol/types';

// TODO Write proper tests and fix `Native` naming issue for values in Fiat USD.
interface UseUpdatedUserAssetsResult<T> {
  amount: bigint;
  assets: Array<T> | undefined;
  index: number;
  mode: FundOperationMode;
  poolChainId: number;
}
const useUpdatedUserAssets = <T extends MarketData>({
  mode,
  index,
  assets,
  amount,
  poolChainId
}: UseUpdatedUserAssetsResult<T>) => {
  const { currentSdk, currentChain } = useMultiIonic();
  const { data: usdPrice } = useUsdPrice(poolChainId);

  return useQuery({
    queryKey: [
      'useUpdatedUserAssets',
      currentChain?.id,
      mode,
      index,
      assets?.map((a) => a.cToken).sort(),
      amount,
      usdPrice,
      currentSdk?.chainId
    ],

    queryFn: async () => {
      if (!assets || !assets.length || !usdPrice || !currentSdk) return [];

      const resAssets = await currentSdk
        .getUpdatedAssets(mode, index, assets, amount)
        .catch((e) => {
          console.warn(
            `Updated assets error: `,
            { amount, assets, index, mode },
            e
          );

          return [];
        });
      const assetsWithPrice: MarketData[] = [];
      if (resAssets && resAssets.length !== 0) {
        resAssets.map((asset) => {
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

      return assetsWithPrice;
    },

    enabled: !!assets && !!usdPrice && !!currentSdk,
    staleTime: Infinity
  });
};

export default useUpdatedUserAssets;

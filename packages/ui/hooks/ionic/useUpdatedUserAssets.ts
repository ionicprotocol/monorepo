import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketData } from '@ui/types/TokensDataMap';

import { useUsdPrice } from '../useUsdPrices';

import type { FundOperationMode } from '@ionicprotocol/types';

interface UseUpdatedUserAssetsResult<T> {
  mode: FundOperationMode;
  index: number;
  assets: Array<T> | undefined;
  amount: bigint;
  poolChainId: number;
  enabled?: boolean;
}

const useUpdatedUserAssets = <T extends MarketData>({
  mode,
  index,
  assets,
  amount,
  poolChainId,
  enabled = false
}: UseUpdatedUserAssetsResult<T>) => {
  const { currentSdk, currentChain } = useMultiIonic();
  const { data: usdPrice, isLoading: isPriceLoading } =
    useUsdPrice(poolChainId);

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
      if (!assets?.length || !usdPrice || !currentSdk) return [];

      try {
        const resAssets = await currentSdk.getUpdatedAssets(
          mode,
          index,
          assets,
          amount
        );

        return resAssets.map((asset) => ({
          ...asset,
          borrowBalanceFiat: asset.borrowBalanceNative * usdPrice,
          liquidityFiat: asset.liquidityNative * usdPrice,
          netSupplyBalanceFiat: asset.netSupplyBalanceNative * usdPrice,
          supplyBalanceFiat: asset.supplyBalanceNative * usdPrice,
          totalBorrowFiat: asset.totalBorrowNative * usdPrice,
          totalSupplyFiat: asset.totalSupplyNative * usdPrice
        }));
      } catch (e) {
        console.warn(
          'Updated assets error: ',
          { amount, assets, index, mode },
          e
        );
        return [];
      }
    },
    enabled: !!assets && !isPriceLoading && !!currentSdk && enabled,
    staleTime: enabled ? 0 : undefined,
    retry: false
  });
};

export default useUpdatedUserAssets;

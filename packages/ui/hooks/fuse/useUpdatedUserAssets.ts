import { FundOperationMode } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useNativePriceInUSD } from '@ui/hooks/useNativePriceInUSD';
import { MarketData } from '@ui/types/TokensDataMap';

// TODO Write proper tests and fix `Native` naming issue for values in Fiat USD.
interface UseUpdatedUserAssetsResult<T> {
  mode: FundOperationMode;
  assets: Array<T> | undefined;
  index: number;
  amount: BigNumber;
  poolChainId: number;
}
const useUpdatedUserAssets = <T extends MarketData>({
  mode,
  index,
  assets,
  amount,
  poolChainId,
}: UseUpdatedUserAssetsResult<T>) => {
  const { currentSdk, currentChain } = useMultiMidas();
  const { data: usdPrice } = useNativePriceInUSD(poolChainId);

  return useQuery(
    [
      'useUpdatedUserAssets',
      currentChain?.id,
      mode,
      index,
      assets?.map((a) => a.cToken).sort(),
      amount,
      usdPrice,
      currentSdk?.chainId,
    ],
    async () => {
      if (!assets || !assets.length || !usdPrice || !currentSdk) return [];

      const resAssets = await currentSdk.getUpdatedAssets(mode, index, assets, amount);
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
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!assets && !!usdPrice && !!currentSdk }
  );
};

export default useUpdatedUserAssets;

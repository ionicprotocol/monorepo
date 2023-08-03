import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useBorrowAPYs = (
  assets?: Pick<MarketData, 'borrowRatePerBlock' | 'cToken'>[],
  chainId?: number
) => {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useBorrowAPYs', { chain: sdk?.chainId }, { assets: assets?.map((a) => a.cToken).sort() }],
    () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: number } = {};

      for (const asset of assets) {
        try {
          const marketBorrowApy =
            sdk.ratePerBlockToAPY(
              asset.borrowRatePerBlock,
              getBlockTimePerMinuteByChainId(chainId)
            ) / 100;

          result[asset.cToken] = marketBorrowApy;
        } catch (e) {
          console.warn(`Getting apy from rate per block error: `, { asset, chainId }, e);
        }
      }

      return result;
    },
    { enabled: !!sdk && !!assets && !!chainId }
  );
};

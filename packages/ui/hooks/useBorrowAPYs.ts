import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useBorrowAPYs = (
  assets: Pick<MarketData, 'borrowRatePerBlock' | 'cToken'>[],
  chainId?: number
) => {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useBorrowAPYs', { chain: sdk?.chainId }, { assets: assets.map((a) => a.cToken).sort() }],
    () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: number } = {};

      for (const asset of assets) {
        const marketBorrowApy =
          sdk.ratePerBlockToAPY(asset.borrowRatePerBlock, getBlockTimePerMinuteByChainId(chainId)) /
          100;

        result[asset.cToken] = marketBorrowApy;
      }

      return result;
    },
    { cacheTime: Infinity, enabled: !!sdk && !!assets && !!chainId, staleTime: Infinity }
  );
};

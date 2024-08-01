import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useSupplyAPYs = (
  assets: Pick<MarketData, 'cToken' | 'supplyRatePerBlock'>[],
  chainId?: number
) => {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: [
      'useSuAPYs',
      { chain: sdk?.chainId },
      { assets: assets.map((a) => a.cToken).sort() }
    ],

    queryFn: () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: number } = {};

      for (const asset of assets) {
        try {
          const marketSupplyApy =
            sdk.ratePerBlockToAPY(
              asset.supplyRatePerBlock,
              getBlockTimePerMinuteByChainId(chainId)
            ) / 100;

          result[asset.cToken] = marketSupplyApy;
        } catch (e) {
          console.warn(
            `Getting apy from rate per block error: `,
            { asset, chainId },
            e
          );
        }
      }

      return result;
    },

    gcTime: Infinity,
    enabled: !!sdk && !!assets && !!chainId,
    staleTime: Infinity
  });
};

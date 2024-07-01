import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { UseAssetsData } from '@ui/hooks/useAssets';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useTotalSupplyAPYs = (
  assets: Pick<
    MarketData,
    'cToken' | 'supplyRatePerBlock' | 'underlyingSymbol' | 'underlyingToken'
  >[],
  chainId?: number,
  allRewards?: UseRewardsData,
  assetInfos?: UseAssetsData
) => {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: [
      'useTotalSupplyAPYs',
      { chain: sdk?.chainId },
      { assets: assets.map((a) => a.cToken).sort() },
      { rewards: allRewards ? Object.keys(allRewards).sort() : undefined },
      { assetInfos: assetInfos ? Object.keys(assetInfos).sort() : undefined }
    ],

    queryFn: async () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: { apy: number; totalApy: number } } =
        {};

      for (const asset of assets) {
        const apy =
          sdk.ratePerBlockToAPY(
            asset.supplyRatePerBlock,
            getBlockTimePerMinuteByChainId(chainId)
          ) / 100;

        let marketTotalAPY = apy;

        if (allRewards && allRewards[asset.cToken]) {
          marketTotalAPY += allRewards[asset.cToken].reduce(
            (acc, cur) => (cur.apy ? acc + cur.apy : acc),
            0
          );
        }

        if (assetInfos && assetInfos[asset.underlyingToken.toLowerCase()]) {
          assetInfos[asset.underlyingToken.toLowerCase()].map((reward) => {
            if (reward.apy) marketTotalAPY += reward.apy;
          });
        }

        result[asset.cToken] = { apy, totalApy: marketTotalAPY };
      }

      return result;
    },

    gcTime: Infinity,
    enabled: !!sdk && !!assets && !!chainId,
    staleTime: Infinity
  });
};

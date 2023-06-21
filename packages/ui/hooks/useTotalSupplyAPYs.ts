import { assetSymbols } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useAnkrBNBApr } from '@ui/hooks/useAnkrBNBApr';
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
  const isEnabled = useMemo(() => {
    return !!assets.find((asset) => asset.underlyingSymbol === assetSymbols.ankrBNB);
  }, [assets]);

  const { data: ankrBNBApr } = useAnkrBNBApr(isEnabled, chainId);

  return useQuery(
    [
      'useTotalSupplyAPYs',
      { chain: sdk?.chainId },
      { assets: assets.map((a) => a.cToken).sort() },
      { rewards: allRewards ? Object.keys(allRewards).sort() : undefined },
      { assetInfos: assetInfos ? Object.keys(assetInfos).sort() : undefined },
      ankrBNBApr,
    ],
    async () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: { apy: number; totalApy: number } } = {};

      for (const asset of assets) {
        const apy =
          sdk.ratePerBlockToAPY(asset.supplyRatePerBlock, getBlockTimePerMinuteByChainId(chainId)) /
          100;

        let marketTotalAPY = apy;

        if (asset.underlyingSymbol === assetSymbols.ankrBNB && ankrBNBApr) {
          marketTotalAPY += Number(ankrBNBApr) / 100;
        }

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
    { cacheTime: Infinity, enabled: !!sdk && !!assets && !!chainId, staleTime: Infinity }
  );
};

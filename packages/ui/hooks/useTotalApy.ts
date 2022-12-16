import { useQuery } from '@tanstack/react-query';

import { useSdk } from './fuse/useSdk';
import { UseAssetsData } from './useAssets';
import { UseRewardsData } from './useRewards';

import { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const useTotalSupplyApyPerAsset = (
  assets: MarketData[],
  chainId?: number,
  allRewards?: UseRewardsData,
  assetInfos?: UseAssetsData
) => {
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useTotalSupplyApyPerAsset',
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)).toString(),
      sdk?.chainId,
      allRewards?.toString(),
      assetInfos?.toString(),
    ],
    async () => {
      if (!sdk || !assets || !chainId) return null;

      const result: { [market: string]: number } = {};

      for (const asset of assets) {
        let marketTotalAPY =
          sdk.ratePerBlockToAPY(asset.supplyRatePerBlock, getBlockTimePerMinuteByChainId(chainId)) /
          100;

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

        result[asset.cToken] = marketTotalAPY;
      }

      return result;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!sdk && !!assets && !!chainId }
  );
};

export const useBorrowApyPerAsset = (assets: MarketData[], chainId?: number) => {
  const sdk = useSdk(chainId);

  return useQuery(
    [
      'useBorrowApyPerAsset',
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)).toString(),
      sdk?.chainId,
    ],
    async () => {
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
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!sdk && !!assets && !!chainId }
  );
};

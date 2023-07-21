import { assetSymbols } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { getAnkrBNBApr } from '@ui/hooks/useAnkrBNBApr';
import type { UseAssetsData } from '@ui/hooks/useAssets';
import type { UseRewardsData } from '@ui/hooks/useRewards';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

export const usePositionsTotalSupplyApy = (
  assets: Pick<
    MarketData,
    'cToken' | 'supplyRatePerBlock' | 'underlyingSymbol' | 'underlyingToken'
  >[],
  chainIds?: number[],
  allRewards?: UseRewardsData,
  assetInfos?: UseAssetsData
) => {
  const { getSdk } = useMultiIonic();

  return useQuery(
    [
      'usePositionsTotalSupplyApy',
      chainIds,
      { assets: assets.map((a) => a.cToken).sort() },
      { rewards: allRewards ? Object.keys(allRewards).sort() : undefined },
      { assetInfos: assetInfos ? Object.keys(assetInfos).sort() : undefined }
    ],
    async () => {
      if (assets && chainIds && chainIds.length > 0) {
        const result: { [market: string]: { apy: number; totalApy: number } } = {};

        await Promise.all(
          chainIds.map(async (chainId, i) => {
            const asset = assets[i];
            const sdk = getSdk(chainId);

            if (sdk && asset) {
              const ankrBNBApr = getAnkrBNBApr(chainId, sdk);
              const apy =
                sdk.ratePerBlockToAPY(
                  asset.supplyRatePerBlock,
                  getBlockTimePerMinuteByChainId(chainId)
                ) / 100;

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
          })
        );

        return result;
      }

      return null;
    },
    { enabled: !!assets && !!chainIds }
  );
};

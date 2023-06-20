import type { SupportedChains } from '@midas-capital/types';
import { assetSymbols } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { aprDays } from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { getAnkrBNBContract } from '@ui/utils/contracts';
import { ChainSupportedAssets } from '@ui/utils/networkData';

export const useAnkrBNBApr = (isEnabled: boolean, poolChainIds?: number[]) => {
  const { getSdk } = useMultiMidas();

  return useQuery(
    ['useAnkrBNBApr', aprDays, poolChainIds, isEnabled],
    async () => {
      if (poolChainIds && poolChainIds.length > 0) {
        return await Promise.all(
          poolChainIds.map(async (poolChainId) => {
            const sdk = getSdk(poolChainId);
            const ankrAsset = ChainSupportedAssets[poolChainId as SupportedChains].find(
              (asset) => asset.symbol === assetSymbols.ankrBNB
            );

            if (sdk && poolChainId && ankrAsset && isEnabled) {
              const contract = getAnkrBNBContract(sdk);
              const apr = await contract.callStatic
                .averagePercentageRate(ankrAsset.underlying, aprDays)
                .catch((e) => {
                  console.warn(
                    `Getting average percentage rate of ankrBNB error: `,
                    { aprDays, poolChainId },
                    e
                  );

                  return constants.Zero;
                });

              return utils.formatUnits(apr);
            } else {
              return null;
            }
          })
        );
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!poolChainId && isEnabled,
      staleTime: Infinity,
    }
  );
};

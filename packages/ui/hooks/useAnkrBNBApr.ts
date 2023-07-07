import type { MidasSdk } from '@ionicprotocol/sdk';
import type { SupportedChains } from '@ionicprotocol/types';
import { assetSymbols } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { aprDays } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getAnkrBNBContract } from '@ui/utils/contracts';
import { ChainSupportedAssets } from '@ui/utils/networkData';

export const getAnkrBNBApr = async (poolChainId: number, sdk: MidasSdk) => {
  const ankrAsset = ChainSupportedAssets[poolChainId as SupportedChains].find(
    (asset) => asset.symbol === assetSymbols.ankrBNB
  );

  if (ankrAsset) {
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
};

export const useAnkrBNBApr = (isEnabled: boolean, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useAnkrBNBApr', sdk?.chainId, poolChainId, isEnabled],
    async () => {
      if (poolChainId && sdk && isEnabled) {
        return await getAnkrBNBApr(poolChainId, sdk);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!poolChainId && isEnabled,
      staleTime: Infinity,
    }
  );
};

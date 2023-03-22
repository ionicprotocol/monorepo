import type { SupportedChains } from '@midas-capital/types';
import { assetSymbols } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { aprDays } from '@ui/constants/index';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getAnkrBNBContract } from '@ui/utils/contracts';
import { ChainSupportedAssets } from '@ui/utils/networkData';

export const useAnkrBNBApr = (isEnabled: boolean, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useAnkrBNBApr', aprDays, sdk?.chainId, poolChainId, isEnabled],
    async () => {
      const ankrAsset = ChainSupportedAssets[poolChainId as SupportedChains].find(
        (asset) => asset.symbol === assetSymbols.ankrBNB
      );

      if (sdk && poolChainId && ankrAsset && isEnabled) {
        const contract = getAnkrBNBContract(sdk);
        const apr = await contract.callStatic.averagePercentageRate(ankrAsset.underlying, aprDays);

        return utils.formatUnits(apr);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!poolChainId && isEnabled,
      staleTime: Infinity,
    }
  );
};

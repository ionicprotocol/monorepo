import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const usePerformanceFee = (poolChainId: number, pluginAddress?: string) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['usePerformanceFee', pluginAddress, sdk?.chainId],
    async () => {
      if (sdk && pluginAddress) {
        const pluginContract = sdk.getMidasErc4626PluginInstance(pluginAddress);
        const performanceFee = await pluginContract.callStatic.performanceFee();

        return Number(utils.formatUnits(performanceFee)) * 100;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!pluginAddress && !!sdk,
    }
  );
};

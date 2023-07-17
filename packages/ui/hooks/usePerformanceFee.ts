import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const usePerformanceFee = (poolChainId: number, pluginAddress?: string) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['usePerformanceFee', pluginAddress, sdk?.chainId],
    async () => {
      if (sdk && pluginAddress) {
        try {
          const pluginContract = sdk.getErc4626PluginInstance(pluginAddress);
          const performanceFee = await pluginContract.callStatic.performanceFee();

          return Number(utils.formatUnits(performanceFee)) * 100;
        } catch (e) {
          console.warn(`Getting performance fee error: `, { pluginAddress, poolChainId }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!pluginAddress && !!sdk,
    }
  );
};

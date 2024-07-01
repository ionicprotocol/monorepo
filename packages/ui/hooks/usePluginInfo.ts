import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const usePluginInfo = (poolChainId: number, pluginAddress?: Address) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['usePluginInfo', pluginAddress, sdk?.chainId],
    () => {
      if (sdk) {
        return pluginAddress && sdk.deployedPlugins[pluginAddress]
          ? sdk.deployedPlugins[pluginAddress]
          : {
              apyDocsUrl: '',
              icon: '',
              market: '',
              name: `Unnamed (${pluginAddress})`,
              strategyDocsUrl: ''
            };
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!pluginAddress && !!sdk,
      staleTime: Infinity
    }
  );
};

import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export const usePluginInfo = (poolChainId: number, pluginAddress?: Address) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['usePluginInfo', pluginAddress, sdk?.chainId],

    queryFn: () => {
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

    enabled: !!pluginAddress && !!sdk,
    staleTime: Infinity
  });
};

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const usePluginInfo = (poolChainId: number, pluginAddress?: string) => {
  const { getSdk } = useMultiMidas();
  const sdk = useMemo(() => getSdk(poolChainId), [poolChainId, getSdk]);

  return useQuery(
    ['usePluginInfo', pluginAddress || '', sdk?.chainId || ''],
    () => {
      if (sdk) {
        return pluginAddress && sdk.deployedPlugins[pluginAddress]
          ? sdk.deployedPlugins[pluginAddress]
          : {
              name: `Unnamed (${pluginAddress})`,
              market: '',
              apyDocsUrl: '',
              strategyDocsUrl: '',
            };
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!pluginAddress && !!sdk,
    }
  );
};

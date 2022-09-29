import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const usePluginInfo = (pluginAddress?: string) => {
  const { currentSdk } = useMultiMidas();

  return useQuery(
    ['usePluginInfo', pluginAddress, currentSdk?.chainId],
    () => {
      if (currentSdk) {
        return pluginAddress && currentSdk.deployedPlugins[pluginAddress]
          ? currentSdk.deployedPlugins[pluginAddress]
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
      enabled: !!pluginAddress && !!currentSdk,
    }
  );
};

import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';

export const usePluginInfo = (pluginAddress?: string) => {
  const { midasSdk } = useMidas();

  return useQuery(
    ['usePluginInfo', pluginAddress, midasSdk.chainId],
    () => {
      return pluginAddress && midasSdk.deployedPlugins[pluginAddress]
        ? midasSdk.deployedPlugins[pluginAddress]
        : {
            name: `Unnamed (${pluginAddress})`,
            market: '',
            apyDocsUrl: '',
          };
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!pluginAddress,
    }
  );
};

import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export const usePluginName = (pluginAddress?: string) => {
  const { midasSdk, currentChain } = useMidas();

  return useQuery(
    ['usePluginName', pluginAddress, currentChain.id],
    () => {
      return pluginAddress && midasSdk.deployedPlugins[pluginAddress]
        ? midasSdk.deployedPlugins[pluginAddress].name
        : `Unnamed (${pluginAddress})`;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!pluginAddress,
    }
  );
};

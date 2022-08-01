import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const usePluginName = (pluginAddress?: string) => {
  const { midasSdk, currentChain } = useRari();

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

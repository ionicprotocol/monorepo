import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const usePluginName = (pluginAddress?: string) => {
  const { fuse, currentChain } = useRari();

  return useQuery(
    ['usePluginName', pluginAddress, currentChain.id],
    () => {
      return pluginAddress && fuse.deployedPlugins[pluginAddress]
        ? fuse.deployedPlugins[pluginAddress].name
        : `Unnamed (${pluginAddress})`;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!pluginAddress,
    }
  );
};

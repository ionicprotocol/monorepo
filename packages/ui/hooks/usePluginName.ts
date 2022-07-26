import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export function usePluginName(underlyingAddress: string, pluginAddress?: string) {
  const { fuse } = useRari();

  return useQuery(
    ['usePluginName', underlyingAddress, pluginAddress, fuse],
    async () => {
      const availablePlugins = fuse.chainPlugins[underlyingAddress] || [];

      if (!pluginAddress) {
        return 'No Plugin';
      } else {
        return availablePlugins.map((plugin) => {
          if (plugin.strategyAddress === pluginAddress) return plugin.strategyName;
        });
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!underlyingAddress }
  );
}

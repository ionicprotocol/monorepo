import { useMemo } from 'react';

import { useRari } from '@ui/context/RariContext';

export const usePluginName = (underlyingAddress: string, pluginAddress?: string) => {
  const { fuse } = useRari();

  const availablePlugins = useMemo(
    () => fuse.chainPlugins[underlyingAddress] || [],
    [fuse.chainPlugins, underlyingAddress]
  );

  const pluginName = useMemo(() => {
    const pluginInfo = availablePlugins.find((plugin) => plugin.strategyAddress === pluginAddress);
    return pluginInfo?.strategyName ? pluginInfo.strategyName : 'No Plugin';
  }, [pluginAddress, availablePlugins]);

  return pluginName;
};

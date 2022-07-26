import { useMemo } from 'react';

import { useRari } from '@ui/context/RariContext';

export const usePluginName = (pluginAddress?: string) => {
  const { fuse } = useRari();

  return useMemo(
    () =>
      pluginAddress && fuse.deployedPlugins[pluginAddress]
        ? fuse.deployedPlugins[pluginAddress].name
        : `Unnamed (${pluginAddress})`,
    [fuse.deployedPlugins, pluginAddress]
  );
};

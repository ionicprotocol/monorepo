import bscDeployedPlugins from '@chains/bsc/plugins';
import moonbeamDeployedPlugins from '@chains/moonbeam/plugins';
import polygonDeployedPlugins from '@chains/polygon/plugins';

import { DeployedPlugins, SupportedChains } from '@midas-capital/types';

type ChainToPlugins = Partial<Record<SupportedChains, DeployedPlugins>>;
export const pluginsOfChain: ChainToPlugins = {
  [SupportedChains.bsc]: bscDeployedPlugins,
  [SupportedChains.moonbeam]: moonbeamDeployedPlugins,
  [SupportedChains.polygon]: polygonDeployedPlugins,
};

import bscDeployedPlugins from '@chains/bsc/plugins';
import polygonDeployedPlugins from '@chains/polygon/plugins';

import { DeployedPlugins, SupportedChains } from '@ionicprotocol/types';

type ChainToPlugins = Partial<Record<SupportedChains, DeployedPlugins>>;
export const pluginsOfChain: ChainToPlugins = {
  [SupportedChains.bsc]: bscDeployedPlugins,
  [SupportedChains.polygon]: polygonDeployedPlugins,
};

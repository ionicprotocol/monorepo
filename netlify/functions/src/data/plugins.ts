import { DeployedPlugins, SupportedChains } from '@ionicprotocol/types';

type ChainToPlugins = Partial<Record<SupportedChains, DeployedPlugins>>;
export const pluginsOfChain: ChainToPlugins = {};

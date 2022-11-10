import { bscFlywheels, moonbeamFlywheels, polygonFlywheels } from './flywheel';

import bscDeployedPlugins from '@chains/bsc/plugins';
import moonbeamDeployedPlugins from '@chains/moonbeam/plugins';
import polygonDeployedPlugins from '@chains/polygon/plugins';
import { DeployedPlugins, SupportedChains } from '@midas-capital/types';

type ChainToPlugins = Partial<Record<SupportedChains, DeployedPlugins>>;

type ChainToFlywheels = Partial<Record<SupportedChains, string[]>>;

type RpcUrls = Partial<Record<SupportedChains, string>>;

export const pluginsOfChain: ChainToPlugins = {
  [SupportedChains.bsc]: bscDeployedPlugins,
  [SupportedChains.moonbeam]: moonbeamDeployedPlugins,
  [SupportedChains.polygon]: polygonDeployedPlugins,
};

export const flywheelsOfChain: ChainToFlywheels = {
  [SupportedChains.bsc]: bscFlywheels,
  [SupportedChains.moonbeam]: moonbeamFlywheels,
  [SupportedChains.polygon]: polygonFlywheels,
};

export const rpcUrls: RpcUrls = {
  [SupportedChains.bsc]: 'https://bsc-dataseed1.binance.org/',
  [SupportedChains.moonbeam]: 'https://moonbeam.api.onfinality.io/public',
  [SupportedChains.polygon]: 'https://rpc-mainnet.matic.quiknode.pro	',
};

import { SupportedChains } from '../config';
import { bscFlywheels, moonbeamFlywheels, polygonFlywheels } from './flywheel';
import { bscPlugins, moonbeamPlugins, polygonPlugins } from './plugins';

type Assets = {
  [chain in SupportedChains]: string[];
};

type RpcUrls = {
  [chain in SupportedChains]: string;
};

export const plugins: Assets = {
  [SupportedChains.bsc]: bscPlugins,
  [SupportedChains.moonbeam]: moonbeamPlugins,
  [SupportedChains.polygon]: polygonPlugins,
};

export const flywheels: Assets = {
  [SupportedChains.bsc]: bscFlywheels,
  [SupportedChains.moonbeam]: moonbeamFlywheels,
  [SupportedChains.polygon]: polygonFlywheels,
};

export const rpcUrls: RpcUrls = {
  [SupportedChains.bsc]: 'https://bsc-dataseed1.binance.org/',
  [SupportedChains.moonbeam]: 'https://moonbeam.api.onfinality.io/public',
  [SupportedChains.polygon]: 'https://rpc-mainnet.matic.quiknode.pro	',
};

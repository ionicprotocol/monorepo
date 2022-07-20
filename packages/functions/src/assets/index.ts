import { SupportedChains } from '../config';
import { bscFlywheels, moonbeamFlywheels } from './flywheel';
import { bscPlugins, moonbeamPlugins } from './plugins';

type Assets = {
  [chain in SupportedChains]: string[];
};

type RpcUrls = {
  [chain in SupportedChains]: string;
};

export const plugins: Assets = {
  [SupportedChains.bsc]: bscPlugins,
  [SupportedChains.moonbeam]: moonbeamPlugins,
};

export const flywheels: Assets = {
  [SupportedChains.bsc]: bscFlywheels,
  [SupportedChains.moonbeam]: moonbeamFlywheels,
};

export const rpcUrls: RpcUrls = {
  [SupportedChains.bsc]: 'https://bsc-dataseed1.binance.org/',
  [SupportedChains.moonbeam]: 'https://moonbeam.api.onfinality.io/public',
};

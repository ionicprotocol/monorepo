import { SupportedChains } from '@midas-capital/sdk';
import { bscFlywheels, moonbeamFlywheels } from './flywheel';
import { bscPlugins, moonbeamPlugins } from './plugins';

export const plugins = {
  [SupportedChains.bsc]: bscPlugins,
  [SupportedChains.moonbeam]: moonbeamPlugins,
};

export const flywheels = {
  [SupportedChains.bsc]: bscFlywheels,
  [SupportedChains.moonbeam]: moonbeamFlywheels,
};

import { bsc, polygon, moonbeam } from '@midas-capital/chains';
import { ChainConfig } from '@midas-capital/types';

function chainConfigToPluginArray(config: ChainConfig): string[] {
  return Object.keys(config.deployedPlugins).map((address) => address.toLocaleLowerCase());
}

export const bscPlugins = chainConfigToPluginArray(bsc);

export const polygonPlugins = chainConfigToPluginArray(polygon);

export const moonbeamPlugins = chainConfigToPluginArray(moonbeam);

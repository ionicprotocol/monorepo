import bscDeployedPlugins from '@chains/bsc/plugins';
import moonbeamDeployedPlugins from '@chains/moonbeam/plugins';
import polygonDeployedPlugins from '@chains/polygon/plugins';
import { DeployedPlugins } from '@midas-capital/types';

function deployedPluginsToPluginArray(deployedPlugins: DeployedPlugins): string[] {
  return Object.keys(deployedPlugins).map((address) => address.toLocaleLowerCase());
}

export const bscPlugins = deployedPluginsToPluginArray(bscDeployedPlugins);

export const polygonPlugins = deployedPluginsToPluginArray(polygonDeployedPlugins);

export const moonbeamPlugins = deployedPluginsToPluginArray(moonbeamDeployedPlugins);

import { ethers } from 'ethers';
import ERC4626_ABI from '../abi/ERC4626.json';
import { functionsAlert } from '../alert';
import { pluginsOfChain } from '../assets';
import { environment, supabase, SupportedChains } from '../config';
import APYProviders from '../providers/apy';

const updatePluginsData = async (chainId: SupportedChains, rpcUrl: string) => {
  const plugins = pluginsOfChain[chainId];
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    for (const [pluginAddress, pluginData] of Object.entries(plugins)) {
      try {
        const pluginContract = new ethers.Contract(pluginAddress, ERC4626_ABI, provider);

        const [totalSupply, totalAssets, underlyingAsset] = await Promise.all([
          pluginContract.callStatic.totalSupply(), // Total Amount of Vault Shares
          pluginContract.callStatic.totalAssets(), // Total Amount of Underlying Managed by the Vault
          pluginContract.callStatic.asset(), // Market Underlying
        ]);

        if (pluginData.strategy && APYProviders[pluginData.strategy]) {
        }

        // Don't save anything if the plugin is empty
        if (totalSupply.eq(0)) {
          continue;
        }

        const { error } = await supabase.from(environment.supabasePluginTableName).insert([
          {
            totalSupply: totalSupply.toString(),
            totalAssets: totalAssets.toString(),
            pluginAddress: pluginAddress.toLowerCase(),
            underlyingAddress: underlyingAsset.toLowerCase(),
            chain: chainId,
          },
        ]);

        if (error) {
          throw new Error(JSON.stringify(error));
        } else {
          console.log(`Successfully saved data for plugin ${plugin}`);
        }
      } catch (exception) {
        console.error(
          `Error occurred during saving data for plugin ${plugin}: ${JSON.stringify(exception)}`
        );
        functionsAlert(
          `Error occurred during saving data for plugin ${plugin}`,
          JSON.stringify(exception)
        );
      }
    }
  } catch (err) {
    console.error(err);
    functionsAlert('Generic Error', JSON.stringify(err));
  }
};

export default updatePluginsData;

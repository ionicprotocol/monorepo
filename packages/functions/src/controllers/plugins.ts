import { ethers } from 'ethers';
import ERC4626_ABI from '../abi/ERC4626.json';
import { functionsAlert } from '../alert';
import { plugins } from '../assets';
import { config, supabase, SupportedChains } from '../config';

const updatePluginsData = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    const deployedPlugins = plugins[chainId];

    for (const plugin of deployedPlugins) {
      try {
        const pluginContract = new ethers.Contract(plugin, ERC4626_ABI, provider);

        const [totalSupply, totalAssets, underlyingAsset] = await Promise.all([
          pluginContract.callStatic.totalSupply(), // Total Amount of Vault Shares
          pluginContract.callStatic.totalAssets(), // Total Amount of Underlying Managed by the Vault
          pluginContract.callStatic.asset(), // Market Underlying
        ]);

        const { error } = await supabase.from(config.supabasePluginTableName).insert([
          {
            totalSupply: totalSupply.toString(),
            totalAssets: totalAssets.toString(),
            pluginAddress: plugin.toLowerCase(),
            underlyingAddress: underlyingAsset.toLowerCase(),
            chain: chainId,
          },
        ]);
        if (error) {
          throw `Error occurred during saving data for plugin ${plugin}:  ${error.message}`;
        } else {
          console.log(`Successfully saved data for plugin ${plugin}`);
        }
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {
    await functionsAlert("Saving Flywheel's plugin", err as string);
    console.error(err);
  }
};

export default updatePluginsData;

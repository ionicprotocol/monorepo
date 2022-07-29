import { ethers } from 'ethers';
import PLUGINS_ABI from '../abi/plugins.json';
import { plugins } from '../assets';
import { config, supabase, SupportedChains } from '../config';

const updatePluginsData = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    const supportedPlugins = plugins[chainId];

    for (const plugin of supportedPlugins) {
      try {
        const contract = new ethers.Contract(plugin, PLUGINS_ABI, provider);

        const [totalSupply, totalAssets, underlyingAsset] = await Promise.all([
          contract.callStatic.totalSupply(),
          contract.callStatic.totalAssets(),
          contract.callStatic.asset(),
        ]);
        // console.log({ totalSupply, totalAssets, underlyingAsset });

        const pricePerShare = !totalSupply.eq('0') ? totalAssets / totalSupply : 0;

        const { error } = await supabase.from(config.supabasePluginTableName).insert([
          {
            totalSupply: totalSupply.toString(),
            totalAssets: totalAssets.toString(),
            pricePerShare: pricePerShare.toString(),
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
    console.error(err);
  }
};

export default updatePluginsData;

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
        const totalSupply = await contract.totalSupply();
        const totalAssets = await contract.totalAssets();
        const underlyingAsset = await contract.asset();
        console.log(totalSupply);
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
          console.log(`Error occurred during saving data for plugin ${plugin}:  ${error.message}`);
        } else {
          console.log(`Successfully saved data for plugin ${plugin}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export default updatePluginsData;

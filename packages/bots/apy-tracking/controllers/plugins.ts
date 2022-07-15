import { ethers } from 'ethers';
import PLUGINS_ABI from '../abi/plugins.json';
import { plugins } from '../assets';
import { config, supabase } from '../config';

const updatePluginsData = async () => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(config.rpcUrl);

    const supportedChain: keyof typeof plugins = config.chain;
    const supportedPlugins = plugins[supportedChain] as any;

    for (const plugin of supportedPlugins) {
      try {
        const contract = new ethers.Contract(plugin, PLUGINS_ABI, provider);
        const totalSupply = await contract.totalSupply();
        const totalAssets = await contract.totalAssets();
        const pricePerShare = !totalSupply.eq('0') ? totalAssets / totalSupply : 0;

        const { error } = await supabase.from('apy').insert([
          {
            totalSupply: totalSupply.toString(),
            totalAssets: totalAssets.toString(),
            pricePerShare: pricePerShare.toString(),
            address: plugin.toLowerCase(),
            chain: config.chain,
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

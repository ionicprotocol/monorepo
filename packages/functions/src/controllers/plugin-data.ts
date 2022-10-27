import { ethers } from 'ethers';
import ERC4626_ABI from '../abi/ERC4626.json';
import { functionsAlert } from '../alert';
import { pluginsOfChain } from '../assets';
import { environment, supabase, SupportedChains } from '../config';

const updatePluginSharePrice = async (chainId: SupportedChains, rpcUrl: string) => {
  const plugins = pluginsOfChain[chainId];

  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    const rows = await Promise.all(
      Object.entries(plugins).map(async ([pluginAddress]) => {
        try {
          const pluginContract = new ethers.Contract(pluginAddress, ERC4626_ABI, provider);

          const [totalSupply, totalAssets, underlyingAsset] = await Promise.all([
            pluginContract.callStatic.totalSupply(), // Total Amount of Vault Shares
            pluginContract.callStatic.totalAssets(), // Total Amount of Underlying Managed by the Vault
            pluginContract.callStatic.asset(), // Market Underlying
          ]);

          return {
            chain: chainId,
            pluginAddress: pluginAddress.toLowerCase(),
            totalAssets: totalAssets.eq(0) ? '1' : totalAssets.toString(),
            totalSupply: totalSupply.eq(0) ? '1' : totalSupply.toString(),
            underlyingAddress: underlyingAsset.toLowerCase(),
          };
        } catch (exception) {
          await functionsAlert(
            `Functions.plugins: Error occurred during saving data for plugin ${pluginAddress}`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const { error } = await supabase.from(environment.supabasePluginTableName).insert(rows);

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  } catch (err) {
    await functionsAlert('Functions.plugins: Generic Error', JSON.stringify(err));
  }
};

export default updatePluginSharePrice;

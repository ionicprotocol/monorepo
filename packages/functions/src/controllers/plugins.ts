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

        const [totalSupply, totalAssets, underlyingAsset, externalAPY] = await Promise.all([
          pluginContract.callStatic.totalSupply(), // Total Amount of Vault Shares
          pluginContract.callStatic.totalAssets(), // Total Amount of Underlying Managed by the Vault
          pluginContract.callStatic.asset(), // Market Underlying
          (async function fetchExternalAPY() {
            let result: number | undefined = undefined;
            if (APYProviders[pluginData.strategy]) {
              try {
                result = await APYProviders[pluginData.strategy]?.getApy(pluginAddress, pluginData);
              } catch (exception) {
                console.error(exception);
              }
            }
            return result;
          })(),
        ]);

        // Don't save anything if the plugin is empty
        if (totalSupply.eq(0)) {
          continue;
        }

        const { error } = await supabase.from(environment.supabasePluginTableName).insert([
          {
            chain: chainId,
            externalAPY: externalAPY ? externalAPY.toString() : undefined,
            pluginAddress: pluginAddress.toLowerCase(),
            totalAssets: totalAssets.toString(),
            totalSupply: totalSupply.toString(),
            underlyingAddress: underlyingAsset.toLowerCase(),
          },
        ]);

        if (error) {
          throw new Error(JSON.stringify(error));
        }
      } catch (exception) {
        console.error(
          `Error occurred during saving data for plugin ${pluginAddress}: ${JSON.stringify(
            exception
          )}`
        );
        functionsAlert(
          `Error occurred during saving data for plugin ${pluginAddress}`,
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

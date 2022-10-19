import { ethers } from 'ethers';
import ERC4626_ABI from '../abi/ERC4626.json';
import { functionsAlert } from '../alert';
import { pluginsOfChain } from '../assets';
import { environment, supabase, SupportedChains } from '../config';
import { getAPYProviders } from '../providers/apy';

const updatePluginsData = async (chainId: SupportedChains, rpcUrl: string) => {
  const plugins = pluginsOfChain[chainId];
  const apyProviders = await getAPYProviders();

  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    await Promise.all(
      Object.entries(plugins).map(async ([pluginAddress, pluginData]) => {
        try {
          const pluginContract = new ethers.Contract(pluginAddress, ERC4626_ABI, provider);

          const [totalSupply, totalAssets, underlyingAsset, externalAPY] = await Promise.all([
            pluginContract.callStatic.totalSupply(), // Total Amount of Vault Shares
            pluginContract.callStatic.totalAssets(), // Total Amount of Underlying Managed by the Vault
            pluginContract.callStatic.asset(), // Market Underlying
            (async function fetchExternalAPY() {
              if (apyProviders[pluginData.strategy]) {
                try {
                  return await apyProviders[pluginData.strategy]?.getApy(pluginAddress, pluginData);
                } catch (exception) {
                  console.error(exception);
                }
              }
            })(),
          ]);

          // Don't save anything if the plugin is empty
          if (totalSupply.eq(0)) {
            return;
          }
          const { error, status, statusText, count, data, body } = await supabase
            .from(environment.supabasePluginTableName)
            .insert([
              {
                chain: chainId,
                externalAPY: externalAPY ? externalAPY.toString() : undefined,
                pluginAddress: pluginAddress.toLowerCase(),
                totalAssets: totalAssets.toString(),
                totalSupply: totalSupply.toString(),
                underlyingAddress: underlyingAsset.toLowerCase(),
              },
            ]);

          console.log({ pluginAddress, status, statusText, count, data, body });
          if (error) {
            throw new Error(JSON.stringify(error));
          }
        } catch (exception) {
          await functionsAlert(
            `Functions.plugins: Error occurred during saving data for plugin ${pluginAddress}`,
            JSON.stringify(exception)
          );
        }
      })
    );
  } catch (err) {
    await functionsAlert('Functions.plugins: Generic Error', JSON.stringify(err));
  }
};

export default updatePluginsData;

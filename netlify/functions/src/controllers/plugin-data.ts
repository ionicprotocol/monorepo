import { SupportedChains } from '@ionicprotocol/types';
import { chainIdtoChain } from '@ionicprotocol/chains';
import { Address, createPublicClient, erc4626Abi, getContract, http } from 'viem';

import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { pluginsOfChain } from '../data/plugins';

export const updatePluginData = async (chainId: SupportedChains, rpcUrl: string) => {
  const plugins = pluginsOfChain[chainId];
  if (!plugins) {
    console.warn(`No Plugins available for ${chainId}`);
    return;
  }

  try {
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId],
      transport: http(rpcUrl),
    });
    const rows = await Promise.all(
      Object.entries(plugins).map(async ([pluginAddress]) => {
        try {
          const pluginContract = getContract({
            address: pluginAddress as Address,
            abi: erc4626Abi,
            client: publicClient,
          });

          const [totalSupply, totalAssets, underlyingAsset] = await Promise.all([
            pluginContract.read.totalSupply(), // Total Amount of Vault Shares
            pluginContract.read.totalAssets(), // Total Amount of Underlying Managed by the Vault
            pluginContract.read.asset(), // Market Underlying
          ]);

          return {
            chain: chainId,
            pluginAddress: pluginAddress.toLowerCase(),
            totalAssets: totalAssets === 0n ? '1' : totalAssets.toString(),
            totalSupply: totalSupply === 0n ? '1' : totalSupply.toString(),
            underlyingAddress: underlyingAsset.toLowerCase(),
          };
        } catch (exception) {
          await functionsAlert(
            `Functions.plugin-data: Error occurred fetching data for plugin ${pluginAddress}`,
            JSON.stringify(exception),
          );
        }
      }),
    );

    const { error } = await supabase
      .from(environment.supabasePluginTableName)
      .insert(rows.filter((r) => !!r));

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  } catch (err) {
    await functionsAlert('Functions.plugin-data: Generic Error', JSON.stringify(err));
  }
};

export default updatePluginData;

import { SupportedChains } from '@midas-capital/types';
import { Handler } from '@netlify/functions';
import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { pluginsOfChain } from '../data/plugins';
import { rpcUrls } from '../data/rpcs';
import { getAPYProviders } from '../providers/rewards/plugins';

export const updatePluginRewards = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const plugins = pluginsOfChain[chainId];

    if (!plugins) {
      console.warn(`No Plugins available for ${chainId}`);
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const apyProviders = await getAPYProviders({
      chainId: chainId,
      provider,
    });

    const results = await Promise.all(
      Object.entries(plugins).map(async ([pluginAddress, pluginData]) => {
        try {
          const apyProvider = apyProviders[pluginData.strategy];
          if (!apyProvider) {
            await functionsAlert(
              `Functions.plugin-rewards: Plugin '${pluginAddress}' (${pluginData.strategy}) / Chain '${chainId}'`,
              `No APYProvider available for: '${pluginData.strategy}' of ${pluginAddress}`
            );
            return undefined;
          }

          return {
            pluginAddress,
            strategy: pluginData.strategy,
            rewards: await apyProvider.getApy(pluginAddress, pluginData),
          };
        } catch (exception) {
          console.error(exception);
          await functionsAlert(
            `Functions.plugin-rewards: Plugin '${pluginAddress}' (${pluginData.strategy}) / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => ({
        plugin_address: r?.pluginAddress.toLowerCase(),
        chain_id: chainId,
        rewards: r?.rewards,
      }));

    const { error } = await supabase.from(environment.supabasePluginRewardsTableName).insert(rows);
    if (error) {
      throw `Error occurred during saving plugin reward results to database: ${error.message}`;
    }
  } catch (exception) {
    await functionsAlert('Functions.plugin-rewards: Generic Error', JSON.stringify(exception));
  }
};

export const createPluginRewardsHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    const rpcURL = rpcUrls[chain];
    if (!rpcURL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'RPC not set' }),
      };
    }
    await updatePluginRewards(chain, rpcURL);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'done' }),
    };
  };

export default createPluginRewardsHandler;

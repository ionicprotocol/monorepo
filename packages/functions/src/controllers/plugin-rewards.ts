import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { pluginsOfChain } from '../assets';
import { environment, supabase } from '../config';
import { getAPYProviders } from '../providers/apy';
import { SupportedChains } from '@midas-capital/types';

const updatePluginRewards = async (chainId: SupportedChains, rpcUrl: string) => {
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
            console.info(
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
          await functionsAlert(
            `Functions.plugin-rewards: Fetching APY for '${pluginAddress}' (${pluginData.strategy})`,
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

export default updatePluginRewards;

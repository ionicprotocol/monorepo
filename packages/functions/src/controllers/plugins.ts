import { functionsAlert } from '../alert';
import { pluginsOfChain } from '../assets';
import { SupportedChains } from '../config';
import { getAPYProviders } from '../providers/apy';

const updatePluginsData = async (chainId: SupportedChains, rpcUrl: string) => {
  const plugins = pluginsOfChain[chainId];
  const apyProviders = await getAPYProviders();
  const results = await Promise.all(
    Object.entries(plugins).map(async ([pluginAddress, pluginData]) => {
      try {
        const apyProvider = apyProviders[pluginData.strategy];
        if (!apyProvider)
          throw `No APYProvider available for: '${pluginData.strategy}' of ${pluginAddress}`;

        return {
          pluginAddress,
          strategy: pluginData.strategy,
          rewards: await apyProvider.getApy(pluginAddress, pluginData),
        };
      } catch (exception) {
        await functionsAlert(
          `Functions.plugins: Fetching APY for '${pluginAddress}' (${pluginData.strategy})`,
          JSON.stringify(exception)
        );
      }
    })
  );

  results.forEach((r) => {
    console.log({ rewards: r?.rewards, p: r?.pluginAddress, s: r?.strategy });
  });
};

export default updatePluginsData;

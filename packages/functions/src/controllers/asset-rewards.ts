import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { getAPYProviders } from '../providers/rewards/assets';
import { SupportedChains } from '@midas-capital/types';

const updateAssetRewards = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const apyProviders = await getAPYProviders({
      chainId: chainId,
      provider,
    });

    const results = await Promise.all(
      Object.entries(apyProviders).map(async ([assetAddress, assetAPYProvider]) => {
        try {
          return assetAPYProvider.getApy(assetAddress, {});
        } catch (exception) {
          await functionsAlert(
            `Functions.asset-rewards: Asset '${assetAddress}' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    // todo
    const rows = results.filter((r) => !!r).map((r) => r);

    const { error } = await supabase.from(environment.supabasePluginRewardsTableName).insert(rows);
    if (error) {
      throw `Error occurred during saving plugin reward results to database: ${error.message}`;
    }
  } catch (exception) {
    await functionsAlert('Functions.plugin-rewards: Generic Error', JSON.stringify(exception));
  }
};

export default updateAssetRewards;

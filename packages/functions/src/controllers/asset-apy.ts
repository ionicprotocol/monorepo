import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { getAPYProviders } from '../providers/rewards/assets';
import { SupportedChains } from '@midas-capital/types';

export const updateAssetApy = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const apyProviders = await getAPYProviders(chainId, {
      chainId: chainId,
      provider,
    });

    const results = await Promise.all(
      Object.entries(apyProviders).map(async ([assetAddress, assetAPYProvider]) => {
        try {
          return {
            asset: assetAddress,
            rewards: await assetAPYProvider.getApy(assetAddress, {}),
          };
        } catch (exception) {
          await functionsAlert(
            `Functions.asset-rewards: Asset '${assetAddress}' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const rows = results
      .filter((r) => !!r)
      .filter((r) => !!r?.rewards)
      .map((r) => ({
        chain_id: chainId,
        address: r?.asset.toLowerCase(),
        rewards: r?.rewards,
        updated_at: new Date().toISOString(),
      }));

    const { error } = await supabase.from(environment.supabaseAssetApyTableName).upsert(rows);
    if (error) {
      throw `Error occurred during saving plugin reward results to database: ${error.message}`;
    }
  } catch (exception) {
    await functionsAlert('Functions.asset-apy: Generic Error', JSON.stringify(exception));
  }
};

export default updateAssetApy;

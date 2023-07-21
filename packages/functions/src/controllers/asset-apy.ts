import { SupportedChains } from '@ionicprotocol/types';
import { Handler } from '@netlify/functions';
import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { rpcUrls } from '../data/rpcs';
import { getAPYProviders } from '../providers/rewards/assets';

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

export const createAssetApyHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    const rpcURL = rpcUrls[chain];
    if (!rpcURL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'RPC not set' }),
      };
    }
    await updateAssetApy(chain, rpcURL);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'done' }),
    };
  };

export default updateAssetApy;

import { SupportedChains } from '@ionicprotocol/types';
import { chainIdtoChain, chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk, optimizedVaultsRegistryAbi } from '@ionicprotocol/sdk';
import { Address, createPublicClient, formatEther, getContract, http } from 'viem';
import { Handler } from '@netlify/functions';

import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';

export const updateVaultData = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const publicClient = createPublicClient({
      chain: chainIdtoChain[chainId],
      transport: http(config.specificParams.metadata.rpcUrls.default.http[0]),
    });
    const sdk = new IonicSdk(publicClient, undefined, config);
    const optimizedVaultsRegistry = getContract({
      address: sdk.chainDeployment.OptimizedVaultsRegistry.address as Address,
      abi: optimizedVaultsRegistryAbi,
      client: publicClient,
    });

    const vaultsData = await optimizedVaultsRegistry.read.getVaultsData();

    const results = vaultsData.map((data) => {
      return {
        vault: data.vault,
        info: {
          totalSupply: data.estimatedTotalAssets.toString(),
          supplyApy: formatEther(data.apr),
        },
      };
    });

    const rows = results
      .filter((r) => !!r)
      .map((r) => ({
        chain_id: chainId,
        vault_address: r.vault.toLowerCase(),
        info: { ...r.info, createdAt: new Date().getTime() },
      }));

    const { error } = await supabase.from(environment.supabaseVaultApyTableName).insert(rows);

    if (error) {
      throw `Error occurred during saving vault results to database: ${error.message}`;
    }
  } catch (err) {
    await functionsAlert('Functions.vault-data: Generic Error', JSON.stringify(err));
  }
};

export const createVaultDataHandler =
  (chain: SupportedChains): Handler =>
  async () => {
    try {
      await updateVaultData(chain);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'done' }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err }),
      };
    }
  };

export default createVaultDataHandler;

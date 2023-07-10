import { SupportedChains } from '@ionicprotocol/types';
import { ethers, utils } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import { OptimizedVaultsRegistry } from '@ionicprotocol/sdk/typechain/OptimizedVaultsRegistry';
import OptimizedVaultsRegistryABI from '@ionicprotocol/sdk/abis/OptimizedVaultsRegistry';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';

export const updateVaultData = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const sdk = new IonicSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );
    const optimizedVaultsRegistry = new ethers.Contract(
      sdk.chainDeployment.OptimizedVaultsRegistry.address,
      OptimizedVaultsRegistryABI,
      sdk.provider
    ) as OptimizedVaultsRegistry;

    const vaultsData = await optimizedVaultsRegistry.callStatic.getVaultsData();

    const results = vaultsData.map((data) => {
      return {
        vault: data.vault,
        info: {
          totalSupply: data.estimatedTotalAssets.toString(),
          supplyApy: utils.formatUnits(data.apr),
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

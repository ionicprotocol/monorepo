import { SupportedChains } from '@midas-capital/types';
import { ethers } from 'ethers';
import { functionsAlert } from '../alert';
import { environment, supabase } from '../config';
import { chainIdToConfig } from '@midas-capital/chains';
import { MidasSdk } from '@midas-capital/sdk';
import { OptimizedVaultsRegistry } from '@midas-capital/sdk/typechain/OptimizedVaultsRegistry';
import OptimizedVaultsRegistryABI from '@midas-capital/sdk/abis/OptimizedVaultsRegistry';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Handler } from '@netlify/functions';

export const updateVaultData = async (chainId: SupportedChains) => {
  try {
    const config = chainIdToConfig[chainId];
    const sdk = new MidasSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );

    const optimizedVaultsRegistry = new ethers.Contract(
      sdk.chainDeployment.optimizedVaultsRegistry.address,
      OptimizedVaultsRegistryABI,
      sdk.provider
    ) as OptimizedVaultsRegistry;

    const vaults = await optimizedVaultsRegistry.callStatic.getAllVaults();

    const results = await Promise.all(
      vaults.map(async (vault) => {
        try {
          const optimizedAPRVault = sdk.createOptimizedAPRVault(vault);

          const [totalSupply, supplyApy] = await Promise.all([
            optimizedAPRVault.callStatic.estimatedTotalAssets(),
            optimizedAPRVault.callStatic.supplyAPY(0),
          ]);

          return {
            vault,
            info: {
              supplyApy: ethers.utils.formatUnits(supplyApy),
              totalSupply,
              updated_at: new Date().toISOString(),
            },
          };
        } catch (exception) {
          console.error(exception);
          await functionsAlert(
            `Functions.vault-data: Vault '${vault}' / Chain '${chainId}'`,
            JSON.stringify(exception)
          );
        }
      })
    );

    const rows = results
      .filter((r) => !!r)
      .map((r) => ({
        chain_id: chainId,
        vault_address: r?.vault.toLowerCase(),
        info: r?.info,
        updated_at: new Date().toISOString(),
      }));

    const { error } = await supabase.from(environment.supabaseVaultApyTableName).insert(rows);

    if (error) {
      throw `Error occurred during saving plugin reward results to database: ${error.message}`;
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

import { VaultData } from "@midas-capital/types";

import { CreateContractsModule } from "./CreateContracts";

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultData[]> {
      try {
        const vaults = await this.contracts.OptimizedVaultsRegistry.callStatic.getAllVaults();

        return await Promise.all(
          vaults.map(async (vault) => {
            const optimizedAPRVault = this.createOptimizedAPRVault(vault);
            const mpo = this.createMasterPriceOracle();

            const [asset, symbol, estimatedTotalAssets, estimatedAPR, adapterCount, emergencyExit, decimals] =
              await Promise.all([
                optimizedAPRVault.callStatic.asset(),
                optimizedAPRVault.callStatic.symbol(),
                optimizedAPRVault.callStatic.estimatedTotalAssets(),
                optimizedAPRVault.callStatic["estimatedAPR()"](),
                optimizedAPRVault.callStatic.adapterCount(),
                optimizedAPRVault.callStatic.emergencyExit(),
                optimizedAPRVault.callStatic.decimals(),
              ]);

            const adapters =
              adapterCount > 0
                ? await Promise.all(
                    Array.from(Array(adapterCount).keys()).map((i) => optimizedAPRVault.callStatic.adapters(i))
                  )
                : [];

            const underlyingPrice = await mpo.callStatic.price(asset);

            return {
              chainId: this.chainId,
              estimatedTotalAssets,
              asset,
              symbol,
              estimatedAPR,
              adapterCount,
              emergencyExit,
              adapters,
              decimals,
              underlyingPrice,
            };
          })
        );
      } catch (error) {
        this.logger.error(`get vaults error in chain ${this.chainId}:  ${error}`);

        throw Error(
          `Getting vaults failed in chain ${this.chainId}: ` + (error instanceof Error ? error.message : error)
        );
      }
    }
  };
}

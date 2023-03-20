import { SupportedChains } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { CreateContractsModule } from "./CreateContracts";

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<
      {
        chainId: SupportedChains;
        estimatedTotalAssets: BigNumber;
        asset: string;
        symbol: string;
      }[]
    > {
      try {
        const vaults = await this.contracts.OptimizedVaultsRegistry.callStatic.getAllVaults();

        return await Promise.all(
          vaults.map(async (vault) => {
            const optimizedAPRVault = this.createOptimizedAPRVault(vault);

            const [asset, symbol, estimatedTotalAssets] = await Promise.all([
              optimizedAPRVault.callStatic.asset(),
              optimizedAPRVault.callStatic.symbol(),
              optimizedAPRVault.callStatic.estimatedTotalAssets(),
            ]);

            return {
              chainId: this.chainId,
              estimatedTotalAssets,
              asset,
              symbol,
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

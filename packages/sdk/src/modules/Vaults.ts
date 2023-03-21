import { SupportedChains } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { CreateContractsModule } from "./CreateContracts";

export type VaultType = {
  chainId: SupportedChains;
  estimatedTotalAssets: BigNumber;
  asset: string;
  symbol: string;
  estimatedAPR: BigNumber;
  adapterCount: number;
  emergencyExit: boolean;
  adapters: ([string, BigNumber] & {
    adapter: string;
    allocation: BigNumber;
  })[];
};

export function withVaults<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Vaults extends Base {
    async getAllVaults(): Promise<VaultType[]> {
      try {
        const vaults = await this.contracts.OptimizedVaultsRegistry.callStatic.getAllVaults();

        return await Promise.all(
          vaults.map(async (vault) => {
            const optimizedAPRVault = this.createOptimizedAPRVault(vault);

            const [asset, symbol, estimatedTotalAssets, estimatedAPR, adapterCount, emergencyExit] = await Promise.all([
              optimizedAPRVault.callStatic.asset(),
              optimizedAPRVault.callStatic.symbol(),
              optimizedAPRVault.callStatic.estimatedTotalAssets(),
              optimizedAPRVault.callStatic["estimatedAPR()"](),
              optimizedAPRVault.callStatic.adapterCount(),
              optimizedAPRVault.callStatic.emergencyExit(),
            ]);

            const adapters =
              adapterCount > 0
                ? await Promise.all(
                    Array.from(Array(adapterCount).keys()).map((i) => optimizedAPRVault.callStatic.adapters(i))
                  )
                : [];

            return {
              chainId: this.chainId,
              estimatedTotalAssets,
              asset,
              symbol,
              estimatedAPR,
              adapterCount,
              emergencyExit,
              adapters,
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

import { chainIdToConfig } from "@midas-capital/chains";
import { SupportedAsset, underlying } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { MidasBaseConstructor } from "..";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";

export function withFusePoolLens<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class FusePoolLens extends Base {
    /**
     * @returns the TVL on current chain in native asset value
     */
    async getTotalValueLocked(whitelistedAdmin = true) {
      const { 2: fusePoolDataStructs } =
        await this.contracts.FusePoolLens.callStatic.getPublicPoolsByVerificationWithData(whitelistedAdmin);

      return fusePoolDataStructs
        .map((data) => data.totalSupply)
        .reduce((prev, cur) => prev.add(cur), BigNumber.from(0));
    }
    async getLiveAssets(): Promise<Set<SupportedAsset>> {
      const pools: FusePoolDirectory.FusePoolStruct[] = await this.contracts.FusePoolDirectory.callStatic.getAllPools();

      const allAssets = new Set<SupportedAsset>();
      for (const pool of pools) {
        const [, , ulTokens] = await this.contracts.FusePoolLens.callStatic.getPoolSummary(pool.comptroller);
        for (const token of ulTokens) {
          const asset = chainIdToConfig[this.chainId].assets.find((x) => x.underlying === token);
          if (!asset) {
            throw new Error(`Asset not found for ${token}, this should never happen`);
          } else {
            allAssets.add(asset);
          }
        }
      }
      return allAssets;
    }
  };
}

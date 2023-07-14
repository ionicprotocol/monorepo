import { chainIdToConfig } from "@ionicprotocol/chains";
import { SupportedAsset } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import { IonicBaseConstructor } from "..";
import { PoolDirectory } from "../../typechain/PoolDirectory";

export function withPoolLens<TBase extends IonicBaseConstructor>(Base: TBase) {
  return class PoolLens extends Base {
    /**
     * @returns the TVL on current chain in native asset value
     */
    async getTotalValueLocked(whitelistedAdmin = true) {
      const { 2: fusePoolDataStructs } = await this.contracts.PoolLens.callStatic.getPublicPoolsByVerificationWithData(
        whitelistedAdmin
      );

      const totalSupply = fusePoolDataStructs
        .map((data) => data.totalSupply)
        .reduce((prev, cur) => prev.add(cur), BigNumber.from(0));

      const totalBorrow = fusePoolDataStructs
        .map((data) => data.totalBorrow)
        .reduce((prev, cur) => prev.add(cur), BigNumber.from(0));

      return { totalSupply, totalBorrow };
    }
    /**
     * @returns a set of the currently live assets on our platform on the current chain
     */
    async getLiveAssets(): Promise<Set<SupportedAsset>> {
      const pools: PoolDirectory.PoolStruct[] = await this.contracts.PoolDirectory.callStatic.getAllPools();

      const allAssets = new Set<SupportedAsset>();
      for (const pool of pools) {
        const [, , ulTokens] = await this.contracts.PoolLens.callStatic.getPoolSummary(pool.comptroller);
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

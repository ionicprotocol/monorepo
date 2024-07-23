import { chainIdToConfig } from "@ionicprotocol/chains";
import { SupportedAsset } from "@ionicprotocol/types";

import { IonicBaseConstructor } from "..";

export interface IPoolLens {
  getTotalValueLocked(whitelistedAdmin?: boolean): Promise<{ totalSupply: bigint; totalBorrow: bigint }>;
  getLiveAssets(): Promise<Set<SupportedAsset>>;
}

export function withPoolLens<TBase extends IonicBaseConstructor>(
  Base: TBase
): {
  new (...args: any[]): IPoolLens;
} & TBase {
  return class PoolLens extends Base {
    /**
     * @returns the TVL on current chain in native asset value
     */
    async getTotalValueLocked(whitelistedAdmin = true) {
      const res = await this.contracts.PoolLens.simulate.getPublicPoolsByVerificationWithData([whitelistedAdmin]);
      const poolDataStructs = res.result[2];

      const totalSupply = poolDataStructs.map((data) => data.totalSupply).reduce((prev, cur) => prev + cur, 0n);

      const totalBorrow = poolDataStructs.map((data) => data.totalBorrow).reduce((prev, cur) => prev + cur, 0n);

      return { totalSupply, totalBorrow };
    }
    /**
     * @returns a set of the currently live assets on our platform on the current chain
     */
    async getLiveAssets(): Promise<Set<SupportedAsset>> {
      const pools = await this.contracts.PoolDirectory.read.getAllPools();

      const allAssets = new Set<SupportedAsset>();
      for (const pool of pools) {
        const res = await this.contracts.PoolLens.simulate.getPoolSummary([pool.comptroller]);
        const [, , ulTokens] = res.result;
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

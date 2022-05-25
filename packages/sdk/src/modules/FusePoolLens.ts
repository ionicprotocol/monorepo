import { BigNumber } from "ethers";

import { FuseBaseConstructor } from "../types";

export function withFusePoolLens<TBase extends FuseBaseConstructor>(Base: TBase) {
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
  };
}

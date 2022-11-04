import { TransactionResponse } from "@ethersproject/providers";
import { BigNumber, utils } from "ethers";

import { MidasBaseConstructor } from "../..";

import { ChainLiquidationConfig, getChainLiquidationConfig } from "./config";
import liquidateUnhealthyBorrows from "./liquidateUnhealthyBorrows";
import { EncodedLiquidationTx, ErroredPool, LiquidatablePool } from "./utils";

import { gatherLiquidations, getAllFusePoolUsers } from "./index";

export function withSafeLiquidator<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class SafeLiquidator extends Base {
    public chainLiquidationConfig: ChainLiquidationConfig = getChainLiquidationConfig(this);

    async getPotentialLiquidations(
      excludedComptrollers: Array<string> = [],
      maxHealthFactor: BigNumber = utils.parseEther("1"),
      configOverrides?: ChainLiquidationConfig
    ): Promise<[Array<LiquidatablePool>, Array<ErroredPool>]> {
      // Get potential liquidations from public pools
      const [fusePoolWithUsers, erroredPools] = await getAllFusePoolUsers(this, maxHealthFactor, excludedComptrollers);
      if (configOverrides)
        this.chainLiquidationConfig = {
          ...this.chainLiquidationConfig,
          ...configOverrides,
        };
      return [await gatherLiquidations(this, fusePoolWithUsers, this.chainLiquidationConfig), erroredPools];
    }
    async liquidatePositions(
      liquidatablePool: LiquidatablePool
    ): Promise<[Array<{ tx: EncodedLiquidationTx; error: string }>, Array<TransactionResponse>]> {
      const [erroredLiquidations, succeededLiquidations] = await liquidateUnhealthyBorrows(this, liquidatablePool);
      return [erroredLiquidations, succeededLiquidations];
    }
  };
}

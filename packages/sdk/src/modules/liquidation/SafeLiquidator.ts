import { BigNumber, Signer, utils, Wallet } from "ethers";

import { MidasBaseConstructor } from "../../types";

import { ChainLiquidationConfig, getChainLiquidationConfig } from "./config";
import liquidateUnhealthyBorrows from "./liquidateUnhealthyBorrows";
import { LiquidatablePool } from "./utils";

import { gatherLiquidations, getAllFusePoolUsers } from "./index";

export function withSafeLiquidator<TBase extends MidasBaseConstructor>(Base: TBase) {
  return class SafeLiquidator extends Base {
    public chainLiquidationConfig: ChainLiquidationConfig = getChainLiquidationConfig(this);

    async getPotentialLiquidations(
      signer: Wallet,
      supportedComptrollers: Array<string> = [],
      maxHealthFactor: BigNumber = utils.parseEther("1"),
      configOverrides?: ChainLiquidationConfig
    ): Promise<Array<LiquidatablePool>> {
      // Get potential liquidations from public pools
      const fusePoolWithUsers = await getAllFusePoolUsers(this, maxHealthFactor, signer);
      const comptrollers = fusePoolWithUsers.map((f) => f.comptroller);
      if (supportedComptrollers.length === 0) supportedComptrollers = comptrollers;

      if (configOverrides)
        this.chainLiquidationConfig = {
          ...this.chainLiquidationConfig,
          ...configOverrides,
        };
      return await gatherLiquidations(this, fusePoolWithUsers, this.chainLiquidationConfig);
    }
    async estimateProfit(liquidation) {}
    async liquidatePositions(positions: Array<LiquidatablePool>) {
      await liquidateUnhealthyBorrows(this, positions);
    }
    async getPositionRation(position) {}
  };
}

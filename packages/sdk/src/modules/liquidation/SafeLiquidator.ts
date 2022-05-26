import { BigNumber, utils } from "ethers";

import { FuseBaseConstructor } from "../../types";

import { ChainLiquidationConfig, getChainLiquidationConfig } from "./config";
import liquidateUnhealthyBorrows from "./liquidateUnhealthyBorrows";
import { LiquidatablePool, PublicPoolUserWithData } from "./utils";

import { gatherLiquidations } from "./index";

export function withSafeLiquidator<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class SafeLiquidator extends Base {
    public chainLiquidationConfig: ChainLiquidationConfig = getChainLiquidationConfig(this);

    async getPotentialLiquidations(
      supportedComptrollers: Array<string> = [],
      maxHealthFactor: BigNumber = utils.parseEther("1"),
      configOverrides?: ChainLiquidationConfig
    ): Promise<Array<LiquidatablePool>> {
      // Get potential liquidations from public pools
      const [comptrollers, users, closeFactors, liquidationIncentives] =
        await this.contracts.FusePoolLens.callStatic.getPublicPoolUsersWithData(maxHealthFactor);
      if (supportedComptrollers.length === 0) supportedComptrollers = comptrollers;
      if (configOverrides)
        this.chainLiquidationConfig = {
          ...this.chainLiquidationConfig,
          ...configOverrides,
        };
      const publicPoolUsersWithData: Array<PublicPoolUserWithData> = comptrollers
        .map((c, i) => {
          return supportedComptrollers.includes(c)
            ? {
                comptroller: c,
                users: users[i],
                closeFactor: closeFactors[i],
                liquidationIncentive: liquidationIncentives[i],
              }
            : null;
        })
        .filter((x): x is PublicPoolUserWithData => x !== null);

      return await gatherLiquidations(this, publicPoolUsersWithData, this.chainLiquidationConfig);
    }
    async estimateProfit(liquidation) {}
    async liquidatePositions(positions: Array<LiquidatablePool>) {
      await liquidateUnhealthyBorrows(this, positions);
    }
    async getPositionRation(position) {}
  };
}

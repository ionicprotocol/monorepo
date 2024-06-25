import { TransactionResponse } from "@ethersproject/providers";
import { BigNumber, utils } from "ethers";

import { IonicSdk } from "../..";
import { CreateContractsModule } from "../CreateContracts";

import { ChainLiquidationConfig, getChainLiquidationConfig } from "./config";
import liquidateUnhealthyBorrows from "./liquidateUnhealthyBorrows";
import { BotType, EncodedLiquidationTx, ErroredPool, LiquidatablePool, PythLiquidatablePool } from "./utils";

import { gatherLiquidations, getAllPoolUsers } from "./index";

export function withSafeLiquidator<TBase extends CreateContractsModule>(Base: TBase) {
  return class SafeLiquidator extends Base {
    public chainLiquidationConfig: ChainLiquidationConfig = getChainLiquidationConfig(this);

    async getPotentialLiquidations<T extends LiquidatablePool | PythLiquidatablePool>(
      excludedComptrollers: Array<string> = [],
      botType: BotType,
      maxHealthFactor: BigNumber = utils.parseEther("1"),
      configOverrides?: ChainLiquidationConfig
    ): Promise<[Array<T>, Array<ErroredPool>]> {
      // Get potential liquidations from public pools
      const [poolWithUsers, erroredPools] = await getAllPoolUsers(
        this as unknown as IonicSdk,
        maxHealthFactor,
        excludedComptrollers
      );

      if (configOverrides)
        this.chainLiquidationConfig = {
          ...this.chainLiquidationConfig,
          ...configOverrides
        };
      const [liquidatablePools, erroredLiquidations] = await gatherLiquidations<T>(
        this as unknown as IonicSdk,
        poolWithUsers,
        this.chainLiquidationConfig,
        botType
      );

      // get unique comptrollers
      const errored = [...erroredPools, ...erroredLiquidations].filter(
        (value, idx, array) => array.findIndex((v2) => v2.comptroller === value.comptroller) === idx
      );
      return [liquidatablePools as T[], errored];
    }
    async liquidatePositions(
      liquidatablePool: LiquidatablePool
    ): Promise<[Array<{ tx: EncodedLiquidationTx; error: string }>, Array<TransactionResponse>]> {
      const [erroredLiquidations, succeededLiquidations] = await liquidateUnhealthyBorrows(this, liquidatablePool);
      return [erroredLiquidations, succeededLiquidations];
    }
  };
}

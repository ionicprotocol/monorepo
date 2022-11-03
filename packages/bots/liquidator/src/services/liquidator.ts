import { MidasSdk } from "@midas-capital/sdk";
import { LiquidatablePool } from "@midas-capital/sdk/dist/cjs/src/modules/liquidation/utils";
import { BigNumber } from "ethers";

import { config, logger } from "..";

import { DiscordService } from "./discord";

export class Liquidator {
  sdk: MidasSdk;
  alert: DiscordService;

  config: Record<string, BigNumber | string | number>;
  constructor(midasSdk: MidasSdk) {
    this.sdk = midasSdk;
    this.alert = new DiscordService(midasSdk.chainId);
  }
  async fetchLiquidations(): Promise<LiquidatablePool[]> {
    const [liquidatablePools, erroredPools] = await this.sdk.getPotentialLiquidations(config.excludedComptrollers);
    if (erroredPools.length > 0) {
      const msg = erroredPools.map((pool) => `Comptroller: ${pool.comptroller} - msg: ${pool.msg}`).join("\n");
      logger.error(`Errored fetching liquidations from pools: ${msg}`);
      this.alert.sendLiquidationFetchingFailure(erroredPools, msg);
    }
    return liquidatablePools;
  }

  async liquidate(liquidations: LiquidatablePool): Promise<void> {
    const [erroredLiquidations, succeededLiquidations] = await this.sdk.liquidatePositions(liquidations);
    if (erroredLiquidations.length > 0) {
      const msg = liquidations.liquidations
        .map((liquidation, index) => {
          return `# Liquidation ${index}:\n - Method: ${liquidation.method}\n - Value: ${
            liquidation.value
          }\n - Args: ${JSON.stringify(liquidation.args)}\n`;
        })
        .join("\n");

      this.alert.sendLiquidationFailure(liquidations, msg);
      logger.error(msg);
    }
    if (succeededLiquidations.length > 0) {
      logger.info(`${succeededLiquidations.length} Liquidations succeeded: \n ${succeededLiquidations.join("\n")}`);
      const msg = succeededLiquidations
        .map((tx, index) => {
          `# Liquidation ${index}:\n - TX Hash: ${tx.hash}`;
        })
        .join("\n");

      logger.info(msg);
      this.alert.sendLiquidationSuccess(succeededLiquidations, msg);
    }
  }
}

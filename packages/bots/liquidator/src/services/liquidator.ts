import { IonicSdk } from "@ionicprotocol/sdk";
import {
  LiquidatablePool,
  PythLiquidatablePool,
  BotType,
} from "@ionicprotocol/sdk/dist/cjs/src/modules/liquidation/utils";

import config, { EXCLUDED_ERROR_CODES } from "../config";
import { logger } from "../logger";

import { DiscordService } from "./discord";
import { EmailService } from "./email";

export class Liquidator {
  sdk: IonicSdk;
  alert: DiscordService;
  email: EmailService;

  constructor(ionicSdk: IonicSdk) {
    this.sdk = ionicSdk;
    this.alert = new DiscordService(ionicSdk.chainId);
    this.email = new EmailService(ionicSdk.chainId);
  }

  async fetchLiquidations<T extends LiquidatablePool | PythLiquidatablePool>(botType: BotType): Promise<T[]> {
    try {
      const [liquidatablePools, erroredPools] = await this.sdk.getPotentialLiquidations<T>(
        config.excludedComptrollers,
        botType
      );
      const filteredErroredPools = erroredPools.filter(
        (pool) => !Object.values(EXCLUDED_ERROR_CODES).includes(pool.error.code)
      );
      if (filteredErroredPools.length > 0) {
        const msg = erroredPools
          .map((pool) => `Comptroller: ${pool.comptroller} - msg: ${pool.msg} ${JSON.stringify(pool.error.stack)}`)
          .join("\n");
        logger.error(`Errored fetching liquidations from pools: ${msg}`);
        this.alert.sendLiquidationFetchingFailure(erroredPools, msg);
      }
      return liquidatablePools as T[];
    } catch (error: any) {
      if (!Object.values(EXCLUDED_ERROR_CODES).includes(error.code)) {
        logger.error(`Error fetching liquidations: ${error}`);
      }
      return [];
    }
  }

  async liquidate(liquidations: LiquidatablePool): Promise<void> {
    const [erroredLiquidations, succeededLiquidations] = await this.sdk.liquidatePositions(liquidations);
    if (erroredLiquidations.length > 0) {
      logger.warn(`${erroredLiquidations.length} Liquidations failed`);
      const logMsg = erroredLiquidations
        .map((liquidation, index) => {
          return `# Liquidation ${index}:\n - Method: ${liquidation.tx.method}\n - Value: ${
            liquidation.tx.value
          }\n - Args: ${JSON.stringify(liquidation.tx.args)}\n - Error: ${liquidation.error}\n`;
        })
        .join("\n");
      const errorMsg = erroredLiquidations.map((liquidation) => liquidation.error).join("\n");
      this.alert.sendLiquidationFailure(liquidations, errorMsg);
      this.email.sendLiquidationFailure(liquidations, errorMsg);
      logger.error(logMsg);
    }
    if (succeededLiquidations.length > 0) {
      logger.info(`${succeededLiquidations.length} Liquidations succeeded`);
      const msg = succeededLiquidations
        .map((tx, index) => {
          `\n# Liquidation ${index}:\n - TX Hash: ${tx.hash}`;
        })
        .join("\n");

      logger.info(msg);
      this.alert.sendLiquidationSuccess(succeededLiquidations, msg);
    }
  }
}

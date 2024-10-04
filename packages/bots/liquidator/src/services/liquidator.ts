import { BotType, ionicLiquidatorAbi, IonicSdk, LiquidatablePool, PythLiquidatablePool } from "@ionicprotocol/sdk";
import { Address } from "viem";

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

  async fetchLiquidations<T extends LiquidatablePool | PythLiquidatablePool>(
    botType: BotType,
    options?: { blockNumber?: bigint }
  ): Promise<T[]> {
    try {
      const [liquidatablePools, erroredPools] = await this.sdk.getPotentialLiquidations<T>(
        config.excludedComptrollers as Address[],
        botType,
        options?.blockNumber
      );
      const filteredErroredPools = erroredPools.filter(
        (pool) => !Object.values(EXCLUDED_ERROR_CODES).includes(pool.error.code)
      );
      if (filteredErroredPools.length > 0) {
        const msg = erroredPools
          .map(
            (pool) =>
              `Comptroller: ${pool.comptroller} - msg: ${pool.msg} ${JSON.stringify(pool.error.chainLiquidationConfig)}`
          )
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

  async liquidate(pool: LiquidatablePool): Promise<void> {
    // Check if the pool has any liquidations
    if (pool.liquidations.length === 0) {
      logger.warn("No liquidations available in the pool.");
      return; // Exit early if there are no liquidations
    }

    // Iterate through the liquidations property, which is an array of FlashSwapLiquidationTxParams
    for (const liquidation of pool.liquidations) {
      const params = {
        borrower: liquidation.borrower,
        cErc20: liquidation.cErc20,
        cTokenCollateral: liquidation.cTokenCollateral,
        debtFundingStrategies: liquidation.debtFundingStrategies,
        debtFundingStrategiesData: liquidation.debtFundingStrategiesData,
        flashSwapContract: liquidation.flashSwapContract,
        minProfitAmount: liquidation.minProfitAmount,
        redemptionStrategies: liquidation.redemptionStrategies,
        strategyData: liquidation.strategyData,
        repayAmount: liquidation.repayAmount,
      };

      try {
        // Call the smart contract function to execute the liquidation
        const sentTx = await this.sdk.walletClient!.writeContract({
          abi: ionicLiquidatorAbi,
          address: this.sdk.contracts.IonicLiquidator.address,
          functionName: "safeLiquidateToTokensWithFlashLoan",
          args: [
            {
              borrower: params.borrower,
              cErc20: params.cErc20,
              cTokenCollateral: params.cTokenCollateral,
              debtFundingStrategies: params.debtFundingStrategies,
              debtFundingStrategiesData: params.debtFundingStrategiesData,
              flashSwapContract: params.flashSwapContract,
              minProfitAmount: params.minProfitAmount,
              redemptionStrategies: params.redemptionStrategies,
              strategyData: params.strategyData,
              repayAmount: params.repayAmount,
            },
          ],
        } as any);

        logger.info(`Liquidation transaction sent: ${sentTx}`);
      } catch (error: any) {
        logger.error(`Liquidation failed for borrower ${params.borrower}: ${error.message}`);
        // this.alert.sendLiquidationFailure([params], error.message); // Send alert for the failed liquidation
      }
    }
  }
}


import { BotType, IonicSdk, LiquidatablePool, PythLiquidatablePool, ionicLiquidatorAbi } from "@ionicprotocol/sdk";
import { Address,  createWalletClient, fallback, http } from "viem";
import config, { EXCLUDED_ERROR_CODES } from "../config";
import { logger } from "../logger";
import { DiscordService } from "./discord";
import { EmailService } from "./email";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
export class Liquidator {
  sdk: IonicSdk;
  alert: DiscordService;
  email: EmailService;
  constructor(ionicSdk: IonicSdk) {
    this.sdk = ionicSdk;
    this.alert = new DiscordService(ionicSdk.chainId);
    this.email = new EmailService(ionicSdk.chainId);
  }
  async fetchLiquidations<T extends LiquidatablePool | PythLiquidatablePool>(botType: BotType, options?: { blockNumber?: bigint }): Promise<T[]> {
    try {
      const blockNumber = options?.blockNumber;
      console.log("Block number:", blockNumber);
      const [liquidatablePools, erroredPools] = await this.sdk.getPotentialLiquidations<T>(
        config.excludedComptrollers as Address[],
        botType,
        blockNumber
      );
      console.log("Bot type:", botType);
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
    const account = privateKeyToAccount("0x2bfaa22319731fd7e1d8a5e9fe1d42ad425c7c4828f177776341d7a551054cf4");

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: fallback([http("https://base-rpc.publicnode.com")]), 
    });
    
  
    console.log("Liquidation Pool:", pool);
    
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
        repayAmount: liquidation.repayAmount
      };
  
      try {
        // Call the smart contract function to execute the liquidation
        const sentTx = await walletClient.writeContract({
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
              repayAmount: params.repayAmount
            }
          ],
          chain: base,
          account: "0x1110DECC92083fbcae218a8478F75B2Ad1b9AEe6"
        });
  
        logger.info(`Liquidation transaction sent: ${sentTx}`);
      } catch (error: any) {
        logger.error(`Liquidation failed for borrower ${params.borrower}: ${error.message}`);
        // this.alert.sendLiquidationFailure([params], error.message); // Send alert for the failed liquidation
      }
    }
  }
}

import { BotType, ionicLiquidatorAbi, IonicSdk, LiquidatablePool, PythLiquidatablePool } from "@ionicprotocol/sdk";
import { Address, TransactionReceipt } from "viem";

import config, { EXCLUDED_ERROR_CODES } from "../config";
import { logger } from "../logger";

import { DiscordService } from "./discordnew";
import { EmailService } from "./email";
export type SimplifiedTransactionReceipt = Pick<
  TransactionReceipt,
  "transactionHash" | "contractAddress" | "from" | "to" | "status"
> & {
  from: `0x${string}` | undefined; // Allowing from to be undefined
};
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

    // Array to collect successful transaction receipts
    const successfulTxs: SimplifiedTransactionReceipt[] = [];

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

        // Ensure the account is defined
        const senderAddress = this.sdk.walletClient!.account;
        if (!senderAddress) {
          throw new Error("Sender address is undefined");
        }

        // Wait for the transaction receipt
        const receipt = await this.sdk.publicClient.waitForTransactionReceipt({ hash: sentTx });

        // Check if the transaction was successful
        if (receipt.status === "success") {
          // Create the transaction receipt
          const transactionReceipt: SimplifiedTransactionReceipt = {
            transactionHash: sentTx, // Assuming sentTx is the transaction hash
            contractAddress: this.sdk.contracts.IonicLiquidator.address, // Set as per your logic
            from: senderAddress as unknown as `0x${string}`, // Cast to the specific format
            to: this.sdk.contracts.IonicLiquidator.address, // Set as needed
            status: receipt.status, // Reflect the actual status
          };
          // Add successful transaction receipt to the array
          successfulTxs.push(transactionReceipt);
        } else {
          throw new Error(`Transaction ${sentTx} failed with status: ${receipt.status}`);
        }
      } catch (error: any) {
        logger.error(`Liquidation failed for borrower ${params.borrower}: ${error.message}`);
        // Create a LiquidatablePool instance for the alert
        const liquidationPool: LiquidatablePool = {
          liquidations: [params],
          comptroller: pool.comptroller, // Use the actual comptroller from the pool
        };
        // Send alert for the failed liquidation
        try {
          await this.alert.sendLiquidationFailure(liquidationPool, error.message);
        } catch (notificationError: any) {
          logger.error(`Failed to send liquidation failure notification: ${notificationError.message}`);
        }
      }
    }

    // Process each successful transaction and send alert
    for (const tx of successfulTxs) {
      try {
        // Wait for the transaction receipt for each successful transaction
        const receipt = await this.sdk.publicClient.waitForTransactionReceipt({ hash: tx.transactionHash });

        // Check if the receipt status is 'success'
        if (receipt.status === "success") {
          // Construct the message for each successful transaction directly
          const msg =
            `Transaction Hash: ${tx.transactionHash}\n` +
            `Contract Address: ${tx.contractAddress}\n` +
            `From Address: ${JSON.stringify(tx.from)}\n` +
            `To Address: ${tx.to}\n` +
            `Status: ${tx.status}\n` +
            `**----------------------------------**`;

          logger.info(`Sending success alert for transaction: ${tx.transactionHash}`);
          // Send the success alert for the individual transaction
          try {
            await this.alert.sendLiquidationSuccess([tx], msg);
          } catch (notificationError: any) {
            logger.error(
              `Failed to send Discord notification for transaction ${tx.transactionHash}: ${notificationError.message}`
            );
          }
        } else {
          throw new Error(`Transaction ${tx.transactionHash} failed after receipt with status: ${receipt.status}`);
        }
      } catch (txError: any) {
        logger.error(`Error processing transaction ${tx.transactionHash}: ${txError.message}`);
        // Depending on your requirements, you might want to handle this differently
        // For example, retry the transaction or notify via another channel
      }
    }
  }
}

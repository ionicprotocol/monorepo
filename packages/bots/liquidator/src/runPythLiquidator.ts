import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { BotType, ionicLiquidatorAbi, PythLiquidatablePool } from "@ionicprotocol/sdk";
import { createPublicClient, createWalletClient, encodeAbiParameters, encodeFunctionData, Hex, http } from "viem";
import { mode } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { sendDiscordNotification } from "./services/PERdiscord"; // Import the new module

import config from "./config";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

(async function () {
  const chainName: string = config.chainName;
  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const publicClient = createPublicClient({
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const ionicSdk = setUpSdk(config.chainId, publicClient, walletClient);
  const ionicLiquidator = ionicSdk.contracts.IonicLiquidator.address as `0x${string}`;

  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);

  const liquidator = new Liquidator(ionicSdk);
  const liquidatablePools = await liquidator.fetchLiquidations<PythLiquidatablePool>(BotType.Pyth);

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);
  const client: Client = new Client({ baseUrl: config.expressRelayEndpoint });

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );

    for (const liquidation of liquidatablePool.liquidations) {
      // Log each argument of the current liquidation
      logger.info(`Borrower Address: ${liquidation.args[0]}`);
      logger.info(`Repay Amount: ${liquidation.args[1].toString()}`);
      logger.info(`cErc20 Address: ${liquidation.args[2]}`);
      logger.info(`cToken Collateral Address: ${liquidation.args[3]}`);
      logger.info(`Minimum Output Amount: ${liquidation.args[4].toString()}`);

      // Log additional details about tokens involved in the liquidation, if applicable
      if (liquidation.buyTokenUnderlying && liquidation.sellTokenUnderlying) {
        logger.info(
          `Buying Token (Underlying): ${
            liquidation.buyTokenUnderlying
          }, Amount: ${liquidation.buyTokenAmount.toString()}`
        );
        logger.info(
          `Selling Token (Underlying): ${
            liquidation.sellTokenUnderlying
          }, Amount: ${liquidation.sellTokenAmount.toString()}`
        );
      }

      const calldata = encodeFunctionData({
        abi: ionicLiquidatorAbi,
        functionName: "safeLiquidate",
        args: [liquidation.args[0], liquidation.args[1], liquidation.args[2], liquidation.args[3], liquidation.args[4]],
      });

      const permissionkeyPayload = encodeAbiParameters([{ type: "address", name: "borrower" }], [liquidation.args[0]]);
      const permissionKey = encodeAbiParameters(
        [
          { type: "address", name: "contract" },
          { type: "bytes", name: "vaultId" },
        ],
        [ionicLiquidator, permissionkeyPayload]
      );

      const opportunity: OpportunityParams = {
        chainId: chainName,
        targetContract: ionicLiquidator,
        targetCalldata: calldata as `0x${string}`,
        permissionKey: permissionKey as `0x${string}`,
        targetCallValue: BigInt(0),
        buyTokens: [
          {
            token: liquidation.buyTokenUnderlying as `0x${string}`,
            amount: BigInt(liquidation.buyTokenAmount.toString()),
          },
        ],
        sellTokens: [
          {
            token: liquidation.sellTokenUnderlying as `0x${string}`,
            amount: BigInt(liquidation.sellTokenAmount.toString()),
          },
        ],
      };

      try {
        await client.submitOpportunity(opportunity);
        console.log("Opportunity submitted successfully: ", opportunity);
        
        // Send a Discord notification
        await sendDiscordNotification(opportunity);
      } catch (error) {
        console.error("Failed to submit opportunity:", {
          error,
          opportunity: JSON.stringify(opportunity, null, 2),
          blockNumber: await publicClient.getBlockNumber(),
        });
      }
    }
  }
})();

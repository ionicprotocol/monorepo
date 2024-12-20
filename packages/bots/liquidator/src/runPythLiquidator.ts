import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { BotType, ionicLiquidatorAbi, PythLiquidatablePool } from "@ionicprotocol/sdk";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  fallback,
  Hex,
  http,
  type PublicClientConfig,
} from "viem";
import { mode } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { sendDiscordNotification } from "./services/PERdiscord";
import config from "./config";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

// Define the start time as a Unix timestamp
const startTime = Math.floor(new Date().getTime() / 1000);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const account = privateKeyToAccount(config.adminPrivateKey as Hex);
const clientConfig: PublicClientConfig = {
  batch: { multicall: { wait: 16 } },
  chain: mode,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
  cacheTime: 4_000,
  pollingInterval: 4_000,
};
const publicClient = createPublicClient(clientConfig);
const walletClient = createWalletClient({
  account,
  chain: mode,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

// Main function to handle liquidations
(async function runPythLiquidator() {
  const chainName: string = config.chainName;
  const ionicSdk = setUpSdk(mode.id, publicClient, walletClient);
  const ionicLiquidator = ionicSdk.contracts.IonicLiquidator.address as `0x${string}`;
  logger.info(`Target Liquidator Contract: ${ionicLiquidator}`);
  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);
  const liquidator = new Liquidator(ionicSdk);

  try {
    const message = `
**runPythLiquidator Loop Started**
- **Start Time**: ${new Date(startTime * 1000).toISOString()}
**----------------------------------------------------------------------------------------**
`;
    logger.info(`${message}`);
    const liquidatablePools = await liquidator.fetchLiquidations<PythLiquidatablePool>(BotType.Pyth);
    logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);
    const client: Client = new Client({ baseUrl: config.expressRelayEndpoint });

    for (const liquidatablePool of liquidatablePools) {
      logger.info(
        `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
      );

      for (const liquidation of liquidatablePool.liquidations) {
        logger.info(`--------------------------------------------------------`);
        logger.info(`Borrower Address: ${liquidation.args[0]}`);
        logger.info(`Repay Amount: ${liquidation.args[1].toString()}`);
        logger.info(`cErc20 Address: ${liquidation.args[2]}`);
        logger.info(`cToken Collateral Address: ${liquidation.args[3]}`);
        logger.info(`Minimum Output Amount: ${liquidation.args[4].toString()}`);

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

          const calldata = encodeFunctionData({
            abi: ionicLiquidatorAbi,
            functionName: "safeLiquidatePyth",
            args: [
              liquidation.args[0],
              liquidation.args[1],
              liquidation.args[2],
              liquidation.args[3],
              liquidation.args[4],
            ],
          });
          logger.info(`Calldata: ${calldata}`);

          const permissionkeyPayload = encodeAbiParameters(
            [{ type: "address", name: "borrower" }],
            [liquidation.args[0]]
          );
          const permissionKey = encodeAbiParameters(
            [
              { type: "address", name: "contract" },
              { type: "bytes", name: "vaultId" },
            ],
            [ionicLiquidator, permissionkeyPayload]
          );
          logger.info(`Permission Key: ${permissionKey}`);

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

          logger.info("Opportunity:", JSON.stringify(opportunity, null, 2));

          try {
            await client.submitOpportunity(opportunity);
            console.info("Opportunity submitted successfully:", opportunity);
            await sendDiscordNotification(opportunity);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : error;
            console.error("Failed to submit opportunity:", {
              error: errorMessage,
              opportunity: JSON.stringify(opportunity, null, 2),
              blockNumber: await publicClient.getBlockNumber(),
            });
            console.error("Detailed Error:", error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error during liquidation process:", error);
  } finally {
    const endMessage = `
    **runPythLiquidator Loop Ended**
    - **Start Time**: ${new Date(startTime * 1000).toISOString()}
    - **End Time**: ${new Date().toISOString()}
    **----------------------------------------------------------------------------------------**
    `;
    logger.info(`${endMessage}`);
  }
})();

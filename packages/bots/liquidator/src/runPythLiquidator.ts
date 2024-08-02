import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import { BotType, ionicLiquidatorAbi, PythLiquidatablePool } from "@ionicprotocol/sdk";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  Hex,
  http,
} from "viem";
import { mode } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { sendDiscordNotification } from "./services/PERdiscord";
import config from "./config";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
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
const ionicSdk = setUpSdk(mode.id, publicClient, walletClient);
const mpo = ionicSdk.createMasterPriceOracle();
async function getTokenDecimals(
  tokenAddress: string,
  publicClient: ReturnType<typeof createPublicClient>
): Promise<number> {
  try {
    const decimals = await publicClient.readContract({
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "decimals",
    });
    return Number(decimals);
  } catch (error) {
    console.error(`Failed to fetch decimals for token ${tokenAddress}:`, error);
    throw error;
  }
}
async function calculateTotalValueInEth(tokenAddress: string, tokenAmount: bigint): Promise<bigint> {
  console.log("Token address:", tokenAddress);
  const decimals = await getTokenDecimals(tokenAddress, publicClient);
  // Fetch the price of the token in ETH using Master Price Oracle
  const priceInETH = await mpo.read.price([tokenAddress as `0x${string}`]);
  const priceInEthBigInt = BigInt(priceInETH.toString());
  // Calculate the scaling factor (10 ** (18 - decimals))
  const scalingFactor = BigInt(10 ** (18 - decimals));
  // Calculate the total value in ETH
  const totalValueInEth = (priceInEthBigInt * tokenAmount * scalingFactor) / BigInt(10 ** 18);
  console.log("Total value in ETH:", totalValueInEth);
  return totalValueInEth;
}
// Function to calculate total token value in ETH
(async function () {
  const chainName: string = config.chainName;
  const ionicSdk = setUpSdk(mode.id, publicClient, walletClient);
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
        // Calculate total value in ETH for buy and sell tokens
        const totalBuyValueInEth = await calculateTotalValueInEth(
          liquidation.buyTokenUnderlying as `0x${string}`,
          BigInt(liquidation.buyTokenAmount.toString())
        );
        const totalSellValueInEth = await calculateTotalValueInEth(
          liquidation.sellTokenUnderlying as `0x${string}`,
          BigInt(liquidation.sellTokenAmount.toString())
        );
        const potentialProfit = totalBuyValueInEth - totalSellValueInEth;
        console.log("PP", potentialProfit);
        logger.info(`Potential Profit in ETH: ${potentialProfit}`);
        const minProfitAmountEth: bigint = BigInt(ionicSdk.chainLiquidationConfig.MINIMUM_PROFIT_NATIVE / BigInt(2));
        console.log("MP", minProfitAmountEth);
        logger.info(`Min Profit Amount in ETH: ${minProfitAmountEth}`);
        if (potentialProfit < minProfitAmountEth) {
          logger.info(
            `Potential profit of ${potentialProfit} is less than the minimum required profit of ${minProfitAmountEth}, skipping liquidation.`
          );
          continue;
        } else {
          const calldata = encodeFunctionData({
            abi: ionicLiquidatorAbi,
            functionName: "safeLiquidate",
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
  }
})();

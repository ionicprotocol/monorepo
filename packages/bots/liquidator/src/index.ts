import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import { createPublicClient, createWalletClient, fallback, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";
import { BotType } from "@ionicprotocol/sdk";

import config from "./config";
import { liquidatePositions } from "./liquidatePositions";
import { logger } from "./logger";
import { setUpSdk } from "./utils";

const HEARTBEAT_API_URL: any = process.env.UPTIME_LIQUIDATOR_API;

if (typeof HEARTBEAT_API_URL === "undefined") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is undefined");
} else if (typeof HEARTBEAT_API_URL !== "string") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is not a string");
} else {
  logger.info(`UPTIME_LIQUIDATOR_API is set to: ${HEARTBEAT_API_URL}`);
}

export const account = privateKeyToAccount(config.adminPrivateKey as Hex);

export const client = createPublicClient({
  chain: mode,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

export const walletClient = createWalletClient({
  account,
  chain: mode,
  transport: fallback(config.rpcUrls.map((url) => http(url))),
});

export const sdk = setUpSdk(config.chainId, client, walletClient);

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  await axios.get(HEARTBEAT_API_URL);
  logger.info(`Heartbeat successfully sent`);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);

  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config })}`);
  await liquidatePositions(BotType.Standard);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};
export { liquidatePositions };

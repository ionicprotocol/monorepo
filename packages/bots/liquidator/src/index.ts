import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

export const HEARTBEAT_API_URL = "https://uptime.betterstack.com/api/v1/heartbeat/3cfTEExZhuh6d4h7TFPp3r1e";
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const client = createPublicClient({
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const sdk = setUpSdk(config.chainId, client, walletClient);

  const liquidator = new Liquidator(sdk);
  await axios.get(HEARTBEAT_API_URL);
  logger.info(`Heartbeat successfully sent to ${HEARTBEAT_API_URL}`);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);

  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config })}`);
  await liquidatePositions(liquidator);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};
export { liquidatePositions };

import { JsonRpcProvider } from "@ethersproject/providers";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import { Wallet } from "ethers";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);
  const HEARTBEAT_API_URL = "https://uptime.betterstack.com/api/v1/heartbeat/3cfTEExZhuh6d4h7TFPp3r1e";
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);

  const liquidator = new Liquidator(sdk);

  sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);

  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config })}`);
  await liquidatePositions(liquidator);

  // Send heartbeat to Better Stack
  try {
    await axios.get(HEARTBEAT_API_URL);
    logger.info(`Heartbeat successfully sent to ${HEARTBEAT_API_URL}`);
  } catch (error: any) {
    logger.error(`Error sending heartbeat to ${HEARTBEAT_API_URL}: ${error.message}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};
export { liquidatePositions };

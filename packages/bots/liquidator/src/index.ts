import { JsonRpcProvider } from "@ethersproject/providers";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import { Wallet } from "ethers";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

const HEARTBEAT_API_URL: string | undefined = process.env.UPTIME_LIQUIDATOR_API;

if (typeof HEARTBEAT_API_URL === "undefined") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is undefined");
  throw new Error("UPTIME_LIQUIDATOR_API environment variable is undefined");
} else if (typeof HEARTBEAT_API_URL !== "string") {
  logger.error("Error: UPTIME_LIQUIDATOR_API environment variable is not a string");
  throw new Error("UPTIME_LIQUIDATOR_API environment variable is not a string");
} else {
  logger.info(`UPTIME_LIQUIDATOR_API is set to: ${HEARTBEAT_API_URL}`);
}
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);

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

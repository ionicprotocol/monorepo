import { JsonRpcProvider } from "@ethersproject/providers";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Wallet } from "ethers";

import config from "./config";
import liquidatePositions from "./liquidatePositions";
import { logger } from "./logger";
import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);

  const liquidator = new Liquidator(sdk);

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

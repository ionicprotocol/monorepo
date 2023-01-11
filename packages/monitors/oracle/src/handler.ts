import { JsonRpcProvider } from "@ethersproject/providers";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Wallet } from "ethers";

import { assets, configs, verifiers } from "./config";
import { baseConfig } from "./config/variables";
import { BatchVerifier } from "./services/verifier";
import { Services } from "./types";

import { logger, setUpSdk } from ".";

const SERVICE = Services.PriceChangeVerifier;

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  const provider = new JsonRpcProvider(baseConfig.rpcUrl);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);

  const sdk = setUpSdk(baseConfig.chainId, signer);

  logger.info(`RUNNING SERVICE: ${SERVICE}`);
  const verifier = new BatchVerifier(sdk, assets[SERVICE]);
  await verifier.batchVerify(verifiers[SERVICE], configs[SERVICE]);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};

import { JsonRpcProvider } from "@ethersproject/providers";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Wallet } from "ethers";

import { assets, configs, verifiers } from "./config";
import { baseConfig } from "./config/variables";
import { logger, setUpSdk } from "./logger";
import { BatchVerifier } from "./services/verifier";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  const provider = new JsonRpcProvider(baseConfig.rpcUrl);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);

  const sdk = setUpSdk(baseConfig.chainId, signer);

  logger.info(`RUNNING SERVICE: ${baseConfig.service}`);
  const verifier = new BatchVerifier(sdk, assets[baseConfig.service]);
  await verifier.batchVerify(verifiers[baseConfig.service], configs[baseConfig.service]);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};

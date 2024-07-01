import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { base, mode, optimism } from "viem/chains";

import { assets, configs, verifiers } from "./config";
import { baseConfig } from "./config/variables";
import { logger, setUpSdk } from "./logger";
import { BatchVerifier } from "./services/verifier";
import { privateKeyToAccount } from "viem/accounts";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);

  let chain;
  switch (baseConfig.chainId) {
    case 34443:
      chain = mode;
      break;
    case 8453:
      chain = base;
      break;
    case 10:
      chain = optimism;
      break;
    case 43114:
      break;
    default:
      logger.error(`Unsupported chainId: ${baseConfig.chainId}`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Unsupported chainId",
        }),
      };
  }

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const account = privateKeyToAccount(baseConfig.adminPrivateKey as Hex);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const sdk = setUpSdk(baseConfig.chainId, client as any, walletClient);

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

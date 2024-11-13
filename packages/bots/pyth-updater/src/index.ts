import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createPublicClient, createWalletClient, fallback, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mode } from 'viem/chains';

import { chainIdToConfig } from './config';
import config from './config/service';
import { logger } from './logger';
import { Updater } from './services';
import { setUpSdk } from './utils';

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);
  logger.info(`Started`);

  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const client = createPublicClient({
    chain: mode,
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const walletClient = createWalletClient({
    account,
    chain: mode,
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const sdk = setUpSdk(config.chainId, client, walletClient);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  await updater.updateFeeds();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};
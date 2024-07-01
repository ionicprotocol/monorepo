import { JsonRpcProvider } from '@ethersproject/providers';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import axios from 'axios';
import { Wallet } from 'ethers';

import { chainIdToConfig } from './config';
import config from './config/service';
import { logger } from './logger';
import { Updater } from './services';
import { setUpSdk } from './utils';

export const HEARTBEAT_API_URL =
  'https://uptime.betterstack.com/api/v1/heartbeat/uyh4vHjKRS6oKAoL4KTqwbVY';
export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event: ${JSON.stringify(event)}`);
  logger.info(`Context: ${JSON.stringify(context)}`);
  logger.info(`Started`);

  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify(config)}`);
  await axios.get(HEARTBEAT_API_URL);
  logger.info(`Heartbeat successfully sent to ${HEARTBEAT_API_URL}`);
  await updater.updateFeeds();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};

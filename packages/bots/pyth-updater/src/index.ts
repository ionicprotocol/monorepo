import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import axios from 'axios';
import { createPublicClient, createWalletClient, fallback, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mode } from 'viem/chains';

import { chainIdToConfig } from './config';
import config from './config/service';
import { logger } from './logger';
import { Updater } from './services';
import { setUpSdk } from './utils';

const HEARTBEAT_API_URL: any = process.env.UPTIME_PYTH_UPDATER_API;

if (typeof HEARTBEAT_API_URL === 'undefined') {
  logger.error('Error: UPTIME_PYTH_UPDATER_API environment variable is undefined');
} else if (typeof HEARTBEAT_API_URL !== 'string') {
  logger.error('Error: UPTIME_PYTH_UPDATER_API environment variable is not a string');
} else {
  logger.info(`UPTIME_PYTH_UPDATER_API is set to: ${HEARTBEAT_API_URL}`);
}
logger.info(`UPTIME_PYTH_UPDATER_API is set to: ${HEARTBEAT_API_URL}`);
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
  sdk.logger.info(`Config for bot: ${JSON.stringify(config)}`);
  await axios.get(HEARTBEAT_API_URL);
  logger.info(`Heartbeat successfully sent`);
  await updater.updateFeeds();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};

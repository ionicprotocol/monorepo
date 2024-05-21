import { JsonRpcProvider } from '@ethersproject/providers';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Wallet } from 'ethers';

import { chainIdToConfig } from './config';
import config from './config/service';
import { logger } from './logger';
import { Updater } from './services';
import { setUpSdk } from './utils';

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
  await updater.updateFeeds();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};
// Function to trigger the test notification
const triggerTestNotification = async (updater: Updater): Promise<void> => {
  try {
    await updater.sendTestNotification();
    logger.info('Test notification sent successfully');
  } catch (error) {
    logger.error(`Error sending test notification: ${error}`);
  }
};
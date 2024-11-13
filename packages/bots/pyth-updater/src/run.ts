import { createPublicClient, createWalletClient, fallback, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mode } from 'viem/chains';
import axios from 'axios';

import { chainIdToConfig } from './config';
import config from './config/service';
import { Updater } from './services';
import { setUpSdk } from './utils';
import { logger } from './logger';

const HEARTBEAT_API_URL: any = process.env.UPTIME_PYTH_UPDATER_API;

if (typeof HEARTBEAT_API_URL === 'undefined') {
  logger.error('Error: UPTIME_PYTH_UPDATER_API environment variable is undefined');
} else if (typeof HEARTBEAT_API_URL !== 'string') {
  logger.error('Error: UPTIME_PYTH_UPDATER_API environment variable is not a string');
} else {
  logger.info(`UPTIME_PYTH_UPDATER_API is set to: ${HEARTBEAT_API_URL}`);
}

export const run = async (): Promise<void> => {
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

  const sdk = setUpSdk(config.chainId, client as any, walletClient);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...config, adminPrivateKey: '*****' })}`);
  
  try {
    await axios.get(HEARTBEAT_API_URL);
    logger.info(`Heartbeat successfully sent`);
  } catch (error) {
    logger.error(`Failed to send heartbeat: ${error}`);
  }

  await updater.updateFeeds();
};

run().catch((error) => {
  logger.error(`Error in main loop: ${error}`);
  process.exit(1);
});

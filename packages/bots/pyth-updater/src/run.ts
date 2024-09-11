import { createPublicClient, createWalletClient, fallback, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mode } from 'viem/chains';

import { chainIdToConfig } from './config';
import config from './config/service';
import { Updater } from './services';
import { setUpSdk } from './utils';

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

  const sdk = setUpSdk(config.chainId, client, walletClient);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...config, adminPrivateKey: '*****' })}`);
  await updater.updateFeeds();
  // await updater.forceUpdateFeeds(assetConfig);
};

run();

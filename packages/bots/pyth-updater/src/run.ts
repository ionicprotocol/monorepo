import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';

import { chainIdToConfig } from './config';
import config from './config/service';
import { Updater } from './services';
import { setUpSdk } from './utils';

export const run = async (): Promise<void> => {
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.adminPrivateKey, provider);

  const sdk = setUpSdk(config.chainId, signer);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...config, adminPrivateKey: '*****' })}`);
  await updater.updateFeeds();
};

run();

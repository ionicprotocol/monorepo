import { createPublicClient, createWalletClient, fallback, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, mode } from 'viem/chains';

import { chainIdToConfig } from './config';
import config from './config/service';
import { Updater } from './services';
import { setUpSdk } from './utils';
export const run = async (): Promise<void> => {
  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  // Determine which chain to use based on chainId
  let chain;
  if (config.chainId === mode.id) {
    chain = mode;
  } else if (config.chainId === base.id) {
    chain = base;
  } else {
    throw new Error(`Unsupported chain ID: ${config.chainId}`);
  }
console.log(config.rpcUrls);
console.log("hghjhjk",chain);
  const client = createPublicClient({
    chain,
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: fallback(config.rpcUrls.map((url) => http(url))),
  });

  const sdk = setUpSdk(config.chainId, client as any, walletClient);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);
  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify({ ...config, adminPrivateKey: '*****' })}`);
  await updater.updateFeeds();
  // await updater.forceUpdateFeeds(assetConfig);
};
run();

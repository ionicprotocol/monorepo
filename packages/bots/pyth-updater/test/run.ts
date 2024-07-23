import { createPublicClient, createWalletClient, Hex, http, PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, mode, optimism } from 'viem/chains';

import { chainIdToConfig } from '../src/config';
import config from '../src/config/service';
import { Updater } from '../src/services';
import { setUpSdk } from '../src/utils';

(async function () {
  let chain;
  switch (config.chainId) {
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
      throw new Error(`Chain id ${config.chainId} not supported`);
  }
  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  const sdk = setUpSdk(config.chainId, client as PublicClient, walletClient);
  const assetConfig = chainIdToConfig[config.chainId];
  const updater = await new Updater(sdk).init(assetConfig);

  sdk.logger.info(`Starting update loop bot on chain: ${config.chainId}`);
  sdk.logger.info(`Config for bot: ${JSON.stringify(config)}`);
  await updater.updateFeeds();
})();

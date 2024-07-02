import { chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import { EvmPriceServiceConnection, Price } from '@pythnetwork/pyth-evm-js';
import {
  Address,
  GetContractReturnType,
  Hex,
  PublicClient,
  TransactionRequest,
  WalletClient,
} from 'viem';

import { logger } from './logger';
import { pythAbi } from './pythAbi';
import { PythAssetConfig } from './types';

export interface PythConfigStorage {
  timestamp: number;
  pythConfig: PythConfig;
}
export interface PythConfig {
  pythNetworkAddress: string;
  debug: boolean;
}

export function addLeading0x(id: string): string {
  if (id.startsWith('0x')) {
    return id;
  }
  return '0x' + id;
}

export type AssetConfigWithPrice = PythAssetConfig & {
  currentPrice?: Price;
  lastPrice?: Omit<Price, 'getPriceAsNumberUnchecked' | 'getConfAsNumberUnchecked' | 'toJson'>;
};

export type PythPrice =
  | Price
  | Omit<Price, 'getPriceAsNumberUnchecked' | 'getConfAsNumberUnchecked' | 'toJson'>;

export async function getCurrentPrices(
  sdk: IonicSdk,
  assetConfigs: PythAssetConfig[],
  connection: EvmPriceServiceConnection,
): Promise<AssetConfigWithPrice[] | undefined> {
  const latestPriceFeeds = await connection.getLatestPriceFeeds(assetConfigs.map((a) => a.priceId));
  if (latestPriceFeeds === undefined) {
    return undefined;
  }
  sdk.logger.debug(`latestPriceFeeds: ${JSON.stringify(latestPriceFeeds)}`);
  return latestPriceFeeds.map((pf, idx) => {
    return {
      ...assetConfigs[idx],
      currentPrice: pf.getPriceUnchecked(),
    };
  });
}

export async function getLastPrices(
  sdk: IonicSdk,
  assetConfigs: PythAssetConfig[],
  pyth: GetContractReturnType<typeof pythAbi, PublicClient>,
): Promise<AssetConfigWithPrice[]> {
  const promises = assetConfigs.map((c) => pyth.read.getPriceUnsafe([c.priceId]));
  const prices = await Promise.all(promises);
  sdk.logger.debug(`lastPrices: ${JSON.stringify(prices)}`);
  return assetConfigs.map((c, idx) => {
    return {
      ...c,
      lastPrice: {
        price: prices[idx].price.toString(),
        conf: prices[idx].conf.toString(),
        expo: prices[idx].expo,
        publishTime: Number(prices[idx].publishTime),
      },
    };
  });
}

export const setUpSdk = (
  chainId: number,
  publicClient: PublicClient,
  walletClient: WalletClient,
) => {
  return new IonicSdk(publicClient, walletClient, chainIdToConfig[chainId], logger);
};

export const priceFeedNeedsUpdate = (sdk: IonicSdk, assetConfig: AssetConfigWithPrice): boolean => {
  const { lastPrice, currentPrice, validTimePeriodSeconds, deviationThresholdBps, priceId } =
    assetConfig;
  let priceDiff = BigInt(lastPrice!.price) - BigInt(currentPrice!.price);
  priceDiff = priceDiff < 0 ? -priceDiff : priceDiff;
  priceDiff *= BigInt(10000); // bps
  priceDiff /= BigInt(lastPrice!.price!);
  const priceExceedsDiff = priceDiff >= deviationThresholdBps;
  const priceIsStale = currentPrice!.publishTime - lastPrice!.publishTime > validTimePeriodSeconds;
  sdk.logger.debug(`
          priceId: ${priceId}
          priceDiff: ${priceDiff}
          priceExceedsDiff: ${priceExceedsDiff}
          priceIsStale: ${priceIsStale}
        `);
  return priceExceedsDiff || priceIsStale;
};

export default async function sendTransactionToPyth(
  sdk: IonicSdk,
  to: Address,
  data: Hex,
  value: bigint,
) {
  // Build data
  const txCount = await sdk.publicClient.getTransactionCount({
    address: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address,
  });

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT! as Address,
    to,
    value,
    data,
    nonce: txCount,
  };
  // Estimate gas for transaction
  const gasLimit = await fetchGasLimitForTransaction(sdk, tx);
  const txRequest: TransactionRequest = {
    ...tx,
    gas: gasLimit,
    gasPrice: ((await sdk.publicClient.getGasPrice()) * 15n) / 10n,
  };

  sdk.logger.info('Signing and sending update price transaction:', tx);

  let sentTx;
  try {
    sentTx = await sdk.walletClient.sendTransaction({
      ...txRequest,
      account: sdk.walletClient.account!.address,
      chain: sdk.walletClient.chain,
    });
    const receipt = await sdk.publicClient.waitForTransactionReceipt({ hash: sentTx });
    if (receipt.status === 'reverted') {
      throw `Error sending update price transaction: Transaction reverted with status 0`;
    }
    sdk.logger.info('Successfully sent update price transaction hash:', sentTx);
    return sentTx;
  } catch (error) {
    throw `Error sending update price transaction: ${error}`;
  }
}

export async function fetchGasLimitForTransaction(sdk: IonicSdk, tx: TransactionRequest) {
  try {
    return ((await sdk.publicClient.estimateGas(tx)) * 15n) / 10n;
  } catch (error) {
    throw `Failed to estimate gas before signing and sending transaction: ${error}`;
  }
}

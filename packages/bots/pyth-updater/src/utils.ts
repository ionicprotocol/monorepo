import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { chainIdToConfig } from '@ionicprotocol/chains';
import { IonicSdk } from '@ionicprotocol/sdk';
import { IPyth } from '@ionicprotocol/sdk/typechain/IPyth';
import { EvmPriceServiceConnection, Price } from '@pythnetwork/pyth-evm-js';
import { Signer, Wallet } from 'ethers';

import { logger } from './logger';
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
  connection: EvmPriceServiceConnection
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
  pyth: IPyth
): Promise<AssetConfigWithPrice[]> {
  const promises = assetConfigs.map((c) => pyth.callStatic.getPriceUnsafe(c.priceId));
  const prices = await Promise.all(promises);
  sdk.logger.debug(`lastPrices: ${JSON.stringify(prices)}`);
  return assetConfigs.map((c, idx) => {
    return {
      ...c,
      lastPrice: {
        price: prices[idx].price.toString(),
        conf: prices[idx].conf.toString(),
        expo: prices[idx].expo,
        publishTime: prices[idx].publishTime.toNumber(),
      },
    };
  });
}

export const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new IonicSdk(provider, chainIdToConfig[chainId], logger);
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
  to: string,
  data: string,
  value: string
) {
  // Build data
  const txCount = await sdk.provider.getTransactionCount(process.env.ETHEREUM_ADMIN_ACCOUNT!);
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, sdk.provider);

  // Build transaction
  const tx = {
    from: process.env.ETHEREUM_ADMIN_ACCOUNT,
    to,
    value,
    data,
    nonce: txCount,
  };
  // Estimate gas for transaction
  const gasLimit = await fetchGasLimitForTransaction(sdk, tx);
  const txRequest: TransactionRequest = {
    ...tx,
    gasLimit: gasLimit,
    gasPrice: (await sdk.provider.getGasPrice()).mul(15).div(10),
  };

  sdk.logger.info('Signing and sending update price transaction:', tx);

  let sentTx;
  try {
    sentTx = await signer.sendTransaction(txRequest);
    const receipt = await sentTx.wait();
    if (receipt.status === 0) {
      throw `Error sending update price transaction: Transaction reverted with status 0`;
    }
    sdk.logger.info('Successfully sent update price transaction hash:', sentTx.hash);
    return sentTx;
  } catch (error) {
    throw `Error sending update price transaction: ${error}`;
  }
}

export async function fetchGasLimitForTransaction(sdk: IonicSdk, tx: TransactionRequest) {
  try {
    return (await sdk.provider.estimateGas(tx)).mul(15).div(10);
  } catch (error) {
    throw `Failed to estimate gas before signing and sending transaction: ${error}`;
  }
}

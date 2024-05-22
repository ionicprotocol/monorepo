import { TransactionResponse } from '@ethersproject/providers';
import { IonicSdk } from '@ionicprotocol/sdk';
import { IPyth } from '@ionicprotocol/sdk/typechain/IPyth';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import PythAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import { Contract, ethers } from 'ethers';

import config from '../config/service';
import { PythAssetConfig } from '../types';
import sendTransactionToPyth, {
  getCurrentPrices,
  getLastPrices,
  priceFeedNeedsUpdate,
} from '../utils';

import { DiscordService } from './discord';

export class Updater {
  sdk: IonicSdk;
  alert: DiscordService;
  pythPriceOracle: Contract;
  pythNetworkAddress: string = ethers.constants.AddressZero;
  connection: EvmPriceServiceConnection;
  assetConfigs: PythAssetConfig[] = [];
  pythContract: IPyth = {} as IPyth;

  constructor(ionicSdk: IonicSdk) {
    this.sdk = ionicSdk;
    this.alert = new DiscordService(ionicSdk.chainId);
    this.pythPriceOracle = new Contract(
      this.sdk.chainDeployment.PythPriceOracle.address,
      ['function PYTH() external view returns (address) '],
      this.sdk.provider
    );
    this.connection = new EvmPriceServiceConnection(config.priceServiceEndpoint);
  }

  async init(assetConfigs: PythAssetConfig[]) {
    this.pythNetworkAddress = await this.pythPriceOracle.callStatic.PYTH();
    this.assetConfigs = assetConfigs;
    this.pythContract = new Contract(this.pythNetworkAddress, PythAbi, this.sdk.provider) as IPyth;
    return this;
  }

  async updateFeeds(): Promise<TransactionResponse | null> {
    const configWithCurrentPrices = await getCurrentPrices(
      this.sdk,
      this.assetConfigs,
      this.connection
    );
    if (configWithCurrentPrices === undefined) {
      this.sdk.logger.error(
        `Error fetching current priceFeeds for priceIds: ${this.assetConfigs.map((a) => a.priceId)}`
      );
      return null;
    }
    const configWithLastPrices = await getLastPrices(
      this.sdk,
      configWithCurrentPrices,
      this.pythContract
    );
    this.sdk.logger.debug(
      `currentPrices: ${JSON.stringify(
        configWithCurrentPrices.map((c) => c.currentPrice?.price)
      )}\nlastPrices: ${JSON.stringify(configWithLastPrices.map((l) => l.lastPrice?.price))}`
    );
    const assetConfigsToUpdate = configWithLastPrices.filter((configWithLastPrice) =>
      priceFeedNeedsUpdate(this.sdk, configWithLastPrice)
    );
    if (assetConfigsToUpdate.length > 0) {
      const publishTimes = assetConfigsToUpdate.map(
        (assetConfig) => assetConfig.currentPrice!.publishTime
      );
      const priceIdsToUpdate = assetConfigsToUpdate.map((assetConfig) => assetConfig.priceId);
      const updatePriceData = await this.connection.getPriceFeedsUpdateData(priceIdsToUpdate);
      const fee = (await this.pythContract.callStatic.getUpdateFee(updatePriceData)).toString();
      const callData = this.pythContract.interface.encodeFunctionData(
        'updatePriceFeedsIfNecessary',
        [updatePriceData, priceIdsToUpdate, publishTimes]
      );
      try {
        const tx = await sendTransactionToPyth(this.sdk, this.pythNetworkAddress, callData, fee);
        this.alert.sendPriceUpdateSuccess(assetConfigsToUpdate, tx);
        return tx;
      } catch (e) {
        this.sdk.logger.error(`Error sending transaction to Pyth: ${e}`);
        this.alert.sendPriceUpdateFailure(assetConfigsToUpdate, JSON.stringify(e));
      }
    } else {
      this.sdk.logger.info('No price feeds need updating');
      this.sdk.logger.debug(
        `Prices: ${assetConfigsToUpdate.map(
          (a) =>
            `priceId: ${a.priceId}:  - current price ${a.currentPrice!.price}\n  - last price ${
              a.lastPrice!.price
            } `
        )}`
      );

      // Constructing a dummy notification with proper Price type
      const dummyNotification = {
        priceId: 'dummyPriceId',
        currentPrice: {
          price: 0,
          publishTime: Math.floor(Date.now() / 1000),
          conf: 0,
          expo: 0,
          getPriceAsNumberUnchecked: () => 0,
          getConfAsNumberUnchecked: () => 0,
          toJson: () => ({ price: 0, conf: 0, expo: 0, publishTime: Math.floor(Date.now() / 1000) }),
        },
        lastPrice: {
          price: 0,
          publishTime: Math.floor(Date.now() / 1000),
          conf: 0,
          expo: 0,
          getPriceAsNumberUnchecked: () => 0,
          getConfAsNumberUnchecked: () => 0,
          toJson: () => ({ price: 0, conf: 0, expo: 0, publishTime: Math.floor(Date.now() / 1000) }),
        },
        configRefreshRateInSeconds: 60,
        validTimePeriodSeconds: 600,
        deviationThresholdBps: 500,
      };

      this.alert.sendPriceUpdateSuccess([dummyNotification], {
        hash: 'dummyTransactionHash',
      } as TransactionResponse);
    }
    return null;
  }

  async forceUpdateFeeds(assetConfig: PythAssetConfig[]): Promise<TransactionResponse | null> {
    const priceIdsToUpdate = assetConfig.map((assetConfig) => assetConfig.priceId);
    const updatePriceData = await this.connection.getPriceFeedsUpdateData(priceIdsToUpdate);
    const fee = (await this.pythContract.callStatic.getUpdateFee(updatePriceData)).toString();
    const callData = this.pythContract.interface.encodeFunctionData('updatePriceFeeds', [
      updatePriceData,
    ]);
    try {
      const tx = await sendTransactionToPyth(this.sdk, this.pythNetworkAddress, callData, fee);
      this.alert.sendPriceUpdateSuccess(assetConfig, tx);
      return tx;
    } catch (e) {
      this.sdk.logger.error(`Error sending transaction to Pyth: ${e}`);
      this.alert.sendPriceUpdateFailure(assetConfig, JSON.stringify(e));
      return null;
    }
  }
}

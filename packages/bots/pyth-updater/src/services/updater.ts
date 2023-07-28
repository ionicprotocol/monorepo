import { IonicSdk } from '@ionicprotocol/sdk';

import config from '../config/service';
import PythAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import { DiscordService } from './discord';
import { Contract } from 'ethers';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { TransactionResponse } from '@ethersproject/providers';
import sendTransactionToPyth, {
  getCurrentPrices,
  getLastPrices,
  priceFeedNeedsUpdate,
} from '../utils';
import { IPyth } from '@ionicprotocol/sdk/typechain/IPyth';
import { PythAssetConfig } from '../types';

export class Updater {
  sdk: IonicSdk;
  alert: DiscordService;
  pythPriceOracle: Contract;
  pythNetworkAddress: string;
  connection: EvmPriceServiceConnection;
  assetConfigs: PythAssetConfig[];
  pythContract: IPyth;

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

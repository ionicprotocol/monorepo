import { IonicSdk } from '@ionicprotocol/sdk';
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import {
  Address,
  Chain,
  getContract,
  GetContractReturnType,
  HttpTransport,
  LocalAccount,
  parseAbi,
  PublicClient,
  TransactionReceipt,
  WalletClient,
  WalletRpcSchema,
} from 'viem';

import config from '../config/service';
import { pythAbi } from '../pythAbi';
import { PythAssetConfig } from '../types';
import { getCurrentPrices, getLastPrices, priceFeedNeedsUpdate } from '../utils';

import { DiscordService } from './discord';

const pythPriceOracleAbi = parseAbi(['function PYTH() external view returns (address)']);
export class Updater {
  sdk: IonicSdk;
  alert: DiscordService;
  pythPriceOracle: GetContractReturnType<typeof pythPriceOracleAbi, PublicClient>;
  pythNetworkAddress: Address;
  connection: EvmPriceServiceConnection;
  assetConfigs: PythAssetConfig[] = [];
  // @ts-ignore
  pythContract: GetContractReturnType<typeof pythAbi, PublicClient> = {} as GetContractReturnType<
    typeof pythAbi,
    WalletClient<HttpTransport, Chain, LocalAccount<string, Address>, WalletRpcSchema>
  >;

  constructor(ionicSdk: IonicSdk) {
    this.sdk = ionicSdk;
    this.alert = new DiscordService(ionicSdk.chainId);
    this.pythPriceOracle = getContract({
      address: this.sdk.chainDeployment.PythPriceOracle.address as Address,
      abi: pythPriceOracleAbi,
      client: this.sdk.publicClient as any,
    }) as any;
    this.connection = new EvmPriceServiceConnection(config.priceServiceEndpoint);
  }

  async init(assetConfigs: PythAssetConfig[]) {
    this.pythNetworkAddress = await this.pythPriceOracle.read.PYTH();
    this.assetConfigs = assetConfigs;
    this.pythContract = getContract({
      address: this.pythNetworkAddress,
      abi: pythAbi,
      client: this.sdk.walletClient as any,
    }) as any;
    return this;
  }

  async updateFeeds(): Promise<TransactionReceipt | null> {
    const configWithCurrentPrices = await getCurrentPrices(
      this.sdk,
      this.assetConfigs,
      this.connection,
    );
    if (configWithCurrentPrices === undefined) {
      this.sdk.logger.error(
        `Error fetching current priceFeeds for priceIds: ${this.assetConfigs.map(
          (a) => a.priceId,
        )}`,
      );
      return null;
    }
    const configWithLastPrices = await getLastPrices(
      this.sdk,
      configWithCurrentPrices,
      this.pythContract,
    );
    this.sdk.logger.debug(
      `currentPrices: ${JSON.stringify(
        configWithCurrentPrices.map((c) => c.currentPrice?.price),
      )}\nlastPrices: ${JSON.stringify(configWithLastPrices.map((l) => l.lastPrice?.price))}`,
    );
    const assetConfigsToUpdate = configWithLastPrices.filter((configWithLastPrice) =>
      priceFeedNeedsUpdate(this.sdk, configWithLastPrice),
    );
    if (assetConfigsToUpdate.length > 0) {
      const publishTimes = assetConfigsToUpdate.map((assetConfig) =>
        BigInt(assetConfig.currentPrice!.publishTime),
      );
      const priceIdsToUpdate = assetConfigsToUpdate.map((assetConfig) => assetConfig.priceId);
      const updatePriceData: Address[] = (await this.connection.getPriceFeedsUpdateData(
        priceIdsToUpdate,
      )) as Address[];
      const fee = await this.pythContract.read.getUpdateFee([updatePriceData]);
      try {
        const tx = await this.pythContract.write.updatePriceFeedsIfNecessary(
          [updatePriceData, priceIdsToUpdate, publishTimes],
          {
            value: fee,
            account: this.sdk.walletClient!.account as any,
            chain: this.sdk.walletClient!.chain as any,
          },
        );
        const receipt = await this.sdk.publicClient.waitForTransactionReceipt({ hash: tx });
        this.alert.sendPriceUpdateSuccess(assetConfigsToUpdate, receipt);
        return receipt;
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
            } `,
        )}`,
      );
    }
    return null;
  }
  async forceUpdateFeeds(assetConfig: PythAssetConfig[]): Promise<TransactionReceipt | null> {
    const priceIdsToUpdate = assetConfig.map((assetConfig) => assetConfig.priceId);
    const updatePriceData: Address[] = (await this.connection.getPriceFeedsUpdateData(
      priceIdsToUpdate,
    )) as Address[];
    const fee = await this.pythContract.read.getUpdateFee([updatePriceData]);
    try {
      const tx = await this.pythContract.write.updatePriceFeeds([updatePriceData], {
        value: fee,
        account: this.sdk.walletClient!.account as any,
        chain: this.sdk.walletClient!.chain as any,
      });
      const receipt = await this.sdk.publicClient.waitForTransactionReceipt({ hash: tx });
      this.alert.sendPriceUpdateSuccess(assetConfig, receipt);
      return receipt;
    } catch (e) {
      this.sdk.logger.error(`Error sending transaction to Pyth: ${e}`);
      this.alert.sendPriceUpdateFailure(assetConfig, JSON.stringify(e));
      return null;
    }
  }
}

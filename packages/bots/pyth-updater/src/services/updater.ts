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

const pythPriceOracleAbi = parseAbi([
  'function implementation() external view returns (address)',
  'function getImplementation() external view returns (address)',
  'function PYTH() external view returns (address)',
  'function pyth() external view returns (address)',
  'function getPyth() external view returns (address)',
  'function pythAddress() external view returns (address)',
  'function getPythAddress() external view returns (address)',
]);
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
    try {
      const proxyAddress = this.sdk.chainDeployment.PythPriceOracle.address as Address;

      console.log('Environment Debug Info:');
      console.log(`Chain ID: ${this.sdk.chainId}`);
      console.log(`Network: ${this.sdk.chainDeployment.name}`);
      console.log(`Proxy Address: ${proxyAddress}`);

      // Different handling based on network
      if (this.sdk.chainId === 8453) {
        // Base mainnet
        this.pythNetworkAddress = '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a' as Address;
        console.log('Using Base network Pyth address');
      } else if (this.sdk.chainId === 34443) {
        // Mode mainnet
        // Use the original proxy address for Mode
        this.pythNetworkAddress = proxyAddress;
        console.log('Using Mode network Pyth address');
      } else {
        console.log(`Using default address for chain ${this.sdk.chainId}`);
        this.pythNetworkAddress = proxyAddress;
      }

      // Verify contract exists
      const code = await this.sdk.publicClient.getBytecode({
        address: this.pythNetworkAddress,
      });
      console.log(`Contract bytecode length: ${code?.length ?? 0}`);

      if (!code) {
        throw new Error(`No contract found at address ${this.pythNetworkAddress}`);
      }

      this.assetConfigs = assetConfigs;
      this.pythContract = getContract({
        address: this.pythNetworkAddress,
        abi: pythAbi,
        client: this.sdk.walletClient as any,
      }) as any;
      return this;
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
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

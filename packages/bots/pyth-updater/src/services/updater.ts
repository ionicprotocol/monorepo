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

      // Debug environment info
      console.log('Environment Debug Info:');
      console.log(`Chain ID: ${this.sdk.chainId}`);
      console.log(`RPC URL: ${this.sdk.publicClient.transport.url}`);
      console.log(`Proxy Address: ${proxyAddress}`);
      console.log(`Node ENV: ${process.env.NODE_ENV}`);

      // First verify the contract exists
      try {
        // Check RPC connection first
        console.log('Checking RPC connection...');
        const blockNumber = await this.sdk.publicClient.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);

        console.log('Checking contract bytecode...');
        const code = await this.sdk.publicClient.getBytecode({ address: proxyAddress });
        console.log(`Contract bytecode length: ${code?.length ?? 0}`);

        if (!code) {
          // Check if we're using the correct chain deployment
          console.log('Chain Deployment Config:', {
            chainId: this.sdk.chainDeployment.chainId,
            deploymentName: this.sdk.chainDeployment.name,
            oracleAddress: this.sdk.chainDeployment.PythPriceOracle?.address,
          });

          throw new Error(`No contract found at address ${proxyAddress}. Please verify:
            1. The contract address is correct for Base network
            2. The RPC endpoint is working and connected to Base
            3. The contract has been deployed to this address`);
        }
      } catch (e: any) {
        console.error('Error details:', {
          message: e.message,
          stack: e.stack,
          cause: e.cause,
        });
        throw e;
      }

      // Try to get implementation address
      let implementationAddress: Address;
      try {
        implementationAddress = await this.pythPriceOracle.read.implementation();
        this.sdk.logger.info(`Found implementation at: ${implementationAddress}`);
      } catch (e: unknown) {
        this.sdk.logger.debug(`Failed to get implementation address: ${(e as Error).message}`);
        try {
          implementationAddress = await this.pythPriceOracle.read.getImplementation();
          this.sdk.logger.info(
            `Found implementation using getImplementation: ${implementationAddress}`,
          );
        } catch (e: unknown) {
          this.sdk.logger.debug(
            `Failed to get implementation using getImplementation: ${(e as Error).message}`,
          );
        }
      }

      // Try all possible function names
      const attempts = [
        { name: 'pythAddress', fn: () => this.pythPriceOracle.read.pythAddress() },
        { name: 'getPythAddress', fn: () => this.pythPriceOracle.read.getPythAddress() },
        { name: 'PYTH', fn: () => this.pythPriceOracle.read.PYTH() },
        { name: 'pyth', fn: () => this.pythPriceOracle.read.pyth() },
        { name: 'getPyth', fn: () => this.pythPriceOracle.read.getPyth() },
      ];

      for (const attempt of attempts) {
        try {
          this.sdk.logger.debug(`Attempting to call ${attempt.name}()`);
          this.pythNetworkAddress = await attempt.fn();
          this.sdk.logger.info(
            `Successfully got Pyth address using ${attempt.name}(): ${this.pythNetworkAddress}`,
          );
          break;
        } catch (e: unknown) {
          this.sdk.logger.debug(`${attempt.name}() failed: ${(e as Error).message}`);
          if (attempt === attempts[attempts.length - 1]) {
            throw new Error('Could not find Pyth address using any known function name');
          }
        }
      }

      if (!this.pythNetworkAddress) {
        throw new Error('Failed to get Pyth network address');
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

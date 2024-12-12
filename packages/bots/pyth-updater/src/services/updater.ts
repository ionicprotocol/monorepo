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
  'function getPythAddress() external view returns (address)',
  'function pyth() external view returns (address)',
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
      this.sdk.logger.info(
        `Initializing Pyth Oracle at ${this.sdk.chainDeployment.PythPriceOracle.address} on chain ${this.sdk.chainId}`,
      );

      // Verify contract existence
      const code = await this.sdk.publicClient.getBytecode({
        address: this.sdk.chainDeployment.PythPriceOracle.address as Address,
      });

      if (!code || code.length === 0) {
        throw new Error('No contract code found at the specified address');
      }
      this.sdk.logger.debug(`Contract exists at address with bytecode length: ${code.length}`);

      try {
        // Log storage values to find the Pyth address
        for (let slot = 0; slot < 5; slot++) {
          const storageValue = await this.sdk.publicClient.request({
            method: 'eth_getStorageAt',
            params: [
              this.sdk.chainDeployment.PythPriceOracle.address as `0x${string}`,
              `0x${slot.toString(16)}`,
              'latest',
            ],
          });
          this.sdk.logger.debug(`Storage slot ${slot}: ${storageValue}`);

          // Check if this looks like an address (0x + 40 hex chars)
          if (storageValue && /^0x[a-fA-F0-9]{40}$/.test(storageValue)) {
            this.pythNetworkAddress = storageValue as Address;
            this.sdk.logger.debug(
              `Found potential Pyth address in slot ${slot}: ${this.pythNetworkAddress}`,
            );
            return this;
          }
        }
        throw new Error('Could not find valid Pyth address in first 5 storage slots');
      } catch (error) {
        this.sdk.logger.error(`Failed to read Pyth address: ${error}`);
        this.sdk.logger.error(`Chain ID: ${this.sdk.chainId}`);
        this.sdk.logger.error(
          `Oracle Address: ${this.sdk.chainDeployment.PythPriceOracle.address}`,
        );
        throw new Error(`Failed to initialize Pyth: ${error}`);
      }

      this.assetConfigs = assetConfigs;
      this.pythContract = getContract({
        address: this.pythNetworkAddress,
        abi: pythAbi,
        client: this.sdk.walletClient as any,
      }) as any;
      return this;
    } catch (error) {
      this.sdk.logger.error(`Failed to initialize updater: ${error}`);
      throw new Error(`Failed to initialize updater: ${error}`);
    }
  }

  async updateFeeds(): Promise<TransactionReceipt | null> {
    // Add Lambda-specific environment debugging
    this.sdk.logger.debug(
      `Environment Info:
      - Running in Lambda: ${!!process.env.AWS_LAMBDA_FUNCTION_NAME}
      - Function Name: ${process.env.AWS_LAMBDA_FUNCTION_NAME || 'Not in Lambda'}
      - Region: ${process.env.AWS_REGION}
      - Memory: ${process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE}
      `,
    );

    // Add detailed chain configuration debugging
    this.sdk.logger.debug(
      `Chain Configuration:
      - SDK ChainId: ${this.sdk.chainId}
      - WalletClient Chain: ${JSON.stringify(this.sdk.walletClient?.chain, null, 2)}
      - PublicClient Chain: ${JSON.stringify(this.sdk.publicClient.chain, null, 2)}
      - RPC URLs: ${process.env.BASE_MAINNET_RPC_URLS ? 'Configured' : 'Missing'}
      - Network Details: ${JSON.stringify(
        {
          name: this.sdk.publicClient.chain?.name,
          nativeCurrency: this.sdk.publicClient.chain?.nativeCurrency,
        },
        null,
        2,
      )}
      `,
    );

    // Add wallet configuration debugging
    this.sdk.logger.debug(
      `Wallet Configuration:
      - Account: ${this.sdk.walletClient?.account?.address}
      - Connected: ${!!this.sdk.walletClient?.account}
      - Transport Type: ${this.sdk.walletClient?.transport?.type}
      `,
    );

    // Add Pyth contract debugging
    this.sdk.logger.debug(
      `Pyth Configuration:
      - PythPriceOracle Address: ${this.sdk.chainDeployment.PythPriceOracle.address}
      - Pyth Network Address: ${this.pythNetworkAddress}
      - Price Service Endpoint: ${config.priceServiceEndpoint}
      `,
    );

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

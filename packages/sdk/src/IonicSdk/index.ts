import {
  ChainAddresses,
  ChainConfig,
  ChainDeployment,
  ChainParams,
  DeployedPlugins,
  FundingStrategy,
  InterestRateModel,
  RedemptionStrategy,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import {
  Address,
  encodeAbiParameters,
  getContract,
  GetContractReturnType,
  keccak256,
  parseAbiParameters,
  PublicClient,
  WalletClient
} from "viem";

import {
  addressesProviderAbi,
  cTokenFirstExtensionAbi,
  eip20InterfaceAbi,
  feeDistributorAbi,
  ionicErc4626Abi,
  ionicFlywheelLensRouterAbi,
  ionicLiquidatorAbi,
  poolDirectoryAbi,
  poolLensAbi,
  poolLensSecondaryAbi,
  unitrollerAbi
} from "../generated";
import { withAsset } from "../modules/Asset";
import { withConvertMantissa } from "../modules/ConvertMantissa";
import { withCreateContracts } from "../modules/CreateContracts";
import { withFlywheel } from "../modules/Flywheel";
import { withFundOperations } from "../modules/FundOperations";
import { withLeverage } from "../modules/Leverage";
import { ChainLiquidationConfig } from "../modules/liquidation/config";
import { withSafeLiquidator } from "../modules/liquidation/SafeLiquidator";
import { withPoolLens } from "../modules/PoolLens";
import { withPools } from "../modules/Pools";
import { withVaults } from "../modules/Vaults";

import { CTOKEN_ERROR_CODES } from "./config";
import AdjustableJumpRateModel from "./irm/AdjustableJumpRateModel";
import JumpRateModel from "./irm/JumpRateModel";
import { getPoolAddress, getPoolComptroller, getPoolUnitroller } from "./utils";

export type StaticContracts = {
  FeeDistributor: GetContractReturnType<typeof feeDistributorAbi, PublicClient>;
  IonicFlywheelLensRouter: GetContractReturnType<typeof ionicFlywheelLensRouterAbi, PublicClient>;
  PoolDirectory: GetContractReturnType<typeof poolDirectoryAbi, PublicClient>;
  PoolLens: GetContractReturnType<typeof poolLensAbi, PublicClient>;
  PoolLensSecondary: GetContractReturnType<typeof poolLensSecondaryAbi, PublicClient>;
  IonicLiquidator: GetContractReturnType<typeof ionicLiquidatorAbi, PublicClient>;
  AddressesProvider: GetContractReturnType<typeof addressesProviderAbi, PublicClient>;
  [contractName: string]: GetContractReturnType;
};

export interface Logger {
  trace(message?: string, ...optionalParams: any[]): void;
  debug(message?: string, ...optionalParams: any[]): void;
  info(message?: string, ...optionalParams: any[]): void;
  warn(message?: string, ...optionalParams: any[]): void;
  error(message?: string, ...optionalParams: any[]): void;
  [x: string]: any;
}

export class IonicBase {
  static CTOKEN_ERROR_CODES = CTOKEN_ERROR_CODES;
  public _publicClient: PublicClient;
  public _walletClient: WalletClient | null;

  public _contracts: StaticContracts | undefined;
  public chainConfig: ChainConfig;
  public availableOracles: Array<string>;
  public chainId: SupportedChains;
  public chainDeployment: ChainDeployment;
  public chainSpecificAddresses: ChainAddresses;
  public chainSpecificParams: ChainParams;
  public deployedPlugins: DeployedPlugins;
  public marketToPlugin: Record<Address, Address>;
  public liquidationConfig: ChainLiquidationConfig;
  public supportedAssets: SupportedAsset[];
  public redemptionStrategies: RedemptionStrategy[];
  public fundingStrategies: FundingStrategy[];

  public logger: Logger;

  public get publicClient(): PublicClient {
    return this._publicClient;
  }

  public get walletClient() {
    if (!this._walletClient) {
      throw new Error("No Wallet Client available.");
    }
    return this._walletClient;
  }

  public set contracts(newContracts: Partial<StaticContracts>) {
    this._contracts = { ...this._contracts, ...newContracts } as StaticContracts;
  }

  public get contracts(): StaticContracts {
    return {
      PoolDirectory: getContract({
        abi: poolDirectoryAbi,
        address: this.chainDeployment.PoolDirectory.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      PoolLens: getContract({
        abi: poolLensAbi,
        address: this.chainDeployment.PoolLens.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      PoolLensSecondary: getContract({
        abi: poolLensSecondaryAbi,
        address: this.chainDeployment.PoolLensSecondary.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      IonicLiquidator: getContract({
        abi: ionicLiquidatorAbi,
        address: this.chainDeployment.IonicLiquidator.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      FeeDistributor: getContract({
        abi: feeDistributorAbi,
        address: this.chainDeployment.FeeDistributor.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      IonicFlywheelLensRouter: getContract({
        abi: ionicFlywheelLensRouterAbi,
        address: this.chainDeployment.IonicFlywheelLensRouter.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      AddressesProvider: getContract({
        abi: addressesProviderAbi,
        address: this.chainDeployment.AddressesProvider.address as Address,
        client: { public: this.publicClient, wallet: this.walletClient }
      }),
      ...this._contracts
    };
  }

  setWalletClient(walletClient: WalletClient) {
    this._walletClient = walletClient;
    return this;
  }

  removeWalletClient(publicClient: PublicClient) {
    this._publicClient = publicClient;
    this._walletClient = null;

    return this;
  }

  constructor(
    publicClient: PublicClient,
    walletClient: WalletClient | undefined,
    chainConfig: ChainConfig,
    logger: Logger = console
  ) {
    this.logger = logger;

    this._publicClient = publicClient;
    this._walletClient = walletClient || null;

    this.chainConfig = chainConfig;
    this.chainId = chainConfig.chainId;
    this.chainDeployment = chainConfig.chainDeployments;
    this.chainSpecificAddresses = chainConfig.chainAddresses;
    this.chainSpecificParams = chainConfig.specificParams;
    this.liquidationConfig = chainConfig.liquidationDefaults;
    this.supportedAssets = chainConfig.assets;
    this.deployedPlugins = chainConfig.deployedPlugins;
    this.marketToPlugin = Object.entries(this.deployedPlugins).reduce((acc, [plugin, pluginData]) => {
      return { ...acc, [pluginData.market]: plugin };
    }, {});
    this.redemptionStrategies = chainConfig.redemptionStrategies;
    this.fundingStrategies = chainConfig.fundingStrategies;
    this.availableOracles = chainConfig.oracles.filter((o) => {
      if (this.chainDeployment[o] === undefined) {
        this.logger.warn(`Oracle ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
  }

  async deployPool(
    poolName: string,
    enforceWhitelist: boolean,
    closeFactor: bigint,
    liquidationIncentive: bigint,
    priceOracle: Address, // Contract address
    whitelist: Address[] // An array of whitelisted addresses
  ): Promise<[string, string, string, number?]> {
    try {
      // Deploy Comptroller implementation if necessary
      const implementationAddress = this.chainDeployment.Comptroller.address as Address;

      // Register new pool with PoolDirectory
      const deployTx = await this.contracts.PoolDirectory.write.deployPool(
        [
          poolName,
          implementationAddress,
          encodeAbiParameters(parseAbiParameters("address"), [this.chainDeployment.FeeDistributor.address as Address]),
          enforceWhitelist,
          closeFactor,
          liquidationIncentive,
          priceOracle
        ],
        { account: this.walletClient.account!.address, chain: this.walletClient.chain }
      );

      const deployReceipt = await this.publicClient.waitForTransactionReceipt({ hash: deployTx });

      this.logger.info(`Deployment of pool ${poolName} succeeded!`, deployReceipt.status);

      let poolId: number | undefined;
      try {
        // Latest Event is PoolRegistered which includes the poolId
        const registerEvent = (
          await this.contracts.PoolDirectory.getEvents.PoolRegistered({
            blockHash: deployReceipt.blockHash
          })
        ).pop();
        poolId = registerEvent && registerEvent.args.index ? Number(registerEvent.args.index.toString()) : undefined;
      } catch (e) {
        this.logger.warn("Unable to retrieve pool ID from receipt events", e);
      }
      const [, existingPools] = await this.contracts.PoolDirectory.read.getActivePools();
      // Compute Unitroller address
      const addressOfSigner = this.walletClient.account!.address;
      const poolAddress = getPoolAddress(
        addressOfSigner,
        poolName,
        BigInt(existingPools.length),
        this.chainDeployment.FeeDistributor.address as Address,
        this.chainDeployment.PoolDirectory.address as Address
      );

      // Accept admin status via Unitroller
      const unitroller = getPoolUnitroller(poolAddress, this.walletClient!);
      const acceptTx = await unitroller.write._acceptAdmin({
        account: this.walletClient.account!.address,
        chain: this.walletClient.chain
      });
      const acceptReceipt = await this.publicClient.waitForTransactionReceipt({ hash: acceptTx });
      this.logger.info(`Accepted admin status for admin: ${acceptReceipt.status}`);

      // Whitelist
      this.logger.info(`enforceWhitelist: ${enforceWhitelist}`);
      if (enforceWhitelist) {
        const comptroller = getPoolComptroller(poolAddress, this.walletClient);

        // Was enforced by pool deployment, now just add addresses
        const whitelistTx = await comptroller.write._setWhitelistStatuses(
          [whitelist, Array(whitelist.length).fill(true)],
          { account: this.walletClient.account!.address, chain: this.walletClient.chain }
        );
        const whitelistReceipt = await this.publicClient.waitForTransactionReceipt({ hash: whitelistTx });
        this.logger.info(`Whitelist updated: ${whitelistReceipt.status}`);
      }

      return [poolAddress, implementationAddress, priceOracle, poolId];
    } catch (error) {
      throw Error(`Deployment of new ionic pool failed:  ${error instanceof Error ? error.message : error}`);
    }
  }

  async identifyInterestRateModel(interestRateModelAddress: Address): Promise<InterestRateModel> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      AdjustableJumpRateModel: AdjustableJumpRateModel
    };
    const bytecode = await this.publicClient.getCode({ address: interestRateModelAddress });
    if (!bytecode) {
      throw Error("Bytecode not found");
    }
    const runtimeBytecodeHash = keccak256(bytecode);

    let irmModel = null;

    for (const irm of Object.values(interestRateModels)) {
      if (runtimeBytecodeHash === irm.RUNTIME_BYTECODE_HASH) {
        irmModel = new irm();
        break;
      }
    }
    if (irmModel === null) {
      throw Error("InterestRateModel not found");
    }
    return irmModel;
  }

  async getInterestRateModel(assetAddress: Address): Promise<InterestRateModel> {
    // Get interest rate model address from asset address
    const assetContract = getContract({
      address: assetAddress,
      abi: cTokenFirstExtensionAbi,
      client: { public: this.publicClient, wallet: this.walletClient }
    });
    const interestRateModelAddress = await assetContract.read.interestRateModel();

    const interestRateModel = await this.identifyInterestRateModel(interestRateModelAddress);
    if (!interestRateModel) {
      throw Error(`No Interest Rate Model found for asset: ${assetAddress}`);
    }
    await interestRateModel.init(interestRateModelAddress, assetAddress, this.publicClient as any);
    return interestRateModel;
  }

  getPriceOracle(oracleAddress: Address): string {
    let oracle = this.availableOracles.find((o) => this.chainDeployment[o].address === oracleAddress);

    if (!oracle) {
      oracle = "Unrecognized Oracle";
    }

    return oracle;
  }

  getEIP20TokenInstance(address: Address, publicClient = this.publicClient, walletClient = this.walletClient) {
    return getContract({ address, abi: eip20InterfaceAbi, client: { public: publicClient, wallet: walletClient } });
  }

  getUnitrollerInstance(
    address: Address,
    publicClient = this.publicClient,
    walletClient = this.walletClient
  ): GetContractReturnType<typeof unitrollerAbi, PublicClient> {
    return getContract({ address, abi: unitrollerAbi, client: { public: publicClient, wallet: walletClient } });
  }

  getPoolDirectoryInstance(
    publicClient = this.publicClient,
    walletClient = this.walletClient
  ): GetContractReturnType<typeof poolDirectoryAbi, PublicClient> {
    return getContract({
      address: this.chainDeployment.PoolDirectory.address as Address,
      abi: poolDirectoryAbi,
      client: { public: publicClient, wallet: walletClient }
    });
  }

  getErc4626PluginInstance(
    address: Address,
    publicClient = this.publicClient,
    walletClient = this.walletClient
  ): GetContractReturnType<typeof ionicErc4626Abi, PublicClient> {
    return getContract({
      address,
      abi: ionicErc4626Abi,
      client: { public: publicClient, wallet: walletClient }
    });
  }
}

const IonicBaseWithModules = withPoolLens(
  withFundOperations(
    withSafeLiquidator(
      withPools(withAsset(withFlywheel(withVaults(withLeverage(withCreateContracts(withConvertMantissa(IonicBase)))))))
    )
  )
);
export class IonicSdk extends IonicBaseWithModules {}
export default IonicSdk;

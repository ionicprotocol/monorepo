import { LogLevel } from "@ethersproject/logger";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
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
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, Signer, utils } from "ethers";

import AddressesProviderArtifact from "../../artifacts/AddressesProvider.sol/AddressesProvider.json";
import CTokenFirstExtensionArtifact from "../../artifacts/CTokenFirstExtension.sol/CTokenFirstExtension.json";
import EIP20InterfaceArtifact from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import FeeDistributorArtifact from "../../artifacts/FeeDistributor.sol/FeeDistributor.json";
import IonicERC4626Artifact from "../../artifacts/IonicERC4626.sol/IonicERC4626.json";
import IonicFlywheelLensRouterArtifact from "../../artifacts/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter.json";
import IonicLiquidatorArtifact from "../../artifacts/IonicLiquidator.sol/IonicLiquidator.json";
import PoolDirectoryArtifact from "../../artifacts/PoolDirectory.sol/PoolDirectory.json";
import PoolLensArtifact from "../../artifacts/PoolLens.sol/PoolLens.json";
import PoolLensSecondaryArtifact from "../../artifacts/PoolLensSecondary.sol/PoolLensSecondary.json";
import UnitrollerArtifact from "../../artifacts/Unitroller.sol/Unitroller.json";
import { AddressesProvider } from "../../typechain/AddressesProvider";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { EIP20Interface } from "../../typechain/EIP20Interface";
import { FeeDistributor } from "../../typechain/FeeDistributor.sol/FeeDistributor";
import { ILiquidator } from "../../typechain/ILiquidator";
import { IonicERC4626 as IonicERC4626 } from "../../typechain/IonicERC4626";
import { IonicFlywheelLensRouter as IonicFlywheelLensRouter } from "../../typechain/IonicFlywheelLensRouter.sol/IonicFlywheelLensRouter";
import { PoolDirectory } from "../../typechain/PoolDirectory";
import { PoolLens } from "../../typechain/PoolLens";
import { PoolLensSecondary } from "../../typechain/PoolLensSecondary.sol/PoolLensSecondary";
import { Unitroller } from "../../typechain/Unitroller";
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
import AdjustableAnkrBNBIrm from "./irm/AdjustableAnkrBNBIrm";
import AdjustableJumpRateModel from "./irm/AdjustableJumpRateModel";
import AnkrBNBInterestRateModel from "./irm/AnkrBNBInterestRateModel";
import AnkrFTMInterestRateModel from "./irm/AnkrFTMInterestRateModel";
import JumpRateModel from "./irm/JumpRateModel";
import { getContract, getPoolAddress, getPoolComptroller, getPoolUnitroller } from "./utils";

utils.Logger.setLogLevel(LogLevel.OFF);

export type SupportedProvider = JsonRpcProvider | Web3Provider;
export type SupportedSigners = Signer | SignerWithAddress;
export type SignerOrProvider = SupportedSigners | SupportedProvider;
export type StaticContracts = {
  FeeDistributor: FeeDistributor;
  IonicFlywheelLensRouter: IonicFlywheelLensRouter;
  PoolDirectory: PoolDirectory;
  PoolLens: PoolLens;
  PoolLensSecondary: PoolLensSecondary;
  IonicLiquidator: ILiquidator;
  AddressesProvider: AddressesProvider;
  [contractName: string]: Contract;
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
  public _provider: SupportedProvider;
  public _signer: SupportedSigners | null;
  static isSupportedProvider(provider: unknown): provider is SupportedProvider {
    return SignerWithAddress.isSigner(provider) || Signer.isSigner(provider);
  }
  static isSupportedSigner(signer: unknown): signer is SupportedSigners {
    return SignerWithAddress.isSigner(signer) || Signer.isSigner(signer);
  }
  static isSupportedSignerOrProvider(signerOrProvider: unknown): signerOrProvider is SignerOrProvider {
    return IonicBase.isSupportedSigner(signerOrProvider) || IonicBase.isSupportedProvider(signerOrProvider);
  }

  public _contracts: StaticContracts | undefined;
  public chainConfig: ChainConfig;
  public availableOracles: Array<string>;
  public chainId: SupportedChains;
  public chainDeployment: ChainDeployment;
  public chainSpecificAddresses: ChainAddresses;
  public chainSpecificParams: ChainParams;
  public deployedPlugins: DeployedPlugins;
  public marketToPlugin: Record<string, string>;
  public liquidationConfig: ChainLiquidationConfig;
  public supportedAssets: SupportedAsset[];
  public redemptionStrategies: RedemptionStrategy[];
  public fundingStrategies: FundingStrategy[];

  public logger: Logger;

  public get provider(): SupportedProvider {
    return this._provider;
  }

  public get signer() {
    if (!this._signer) {
      throw new Error("No Signer available.");
    }
    return this._signer;
  }

  public set contracts(newContracts: Partial<StaticContracts>) {
    this._contracts = { ...this._contracts, ...newContracts } as StaticContracts;
  }

  public get contracts(): StaticContracts {
    return {
      PoolDirectory: new Contract(
        this.chainDeployment.PoolDirectory.address,
        PoolDirectoryArtifact.abi,
        this.provider
      ) as PoolDirectory,
      PoolLens: new Contract(this.chainDeployment.PoolLens.address, PoolLensArtifact.abi, this.provider) as PoolLens,
      PoolLensSecondary: new Contract(
        this.chainDeployment.PoolLensSecondary.address,
        PoolLensSecondaryArtifact.abi,
        this.provider
      ) as PoolLensSecondary,
      IonicLiquidator: new Contract(
        // this.chainId == 34443
        //   ? this.chainDeployment.IonicUniV3Liquidator.address :
        this.chainDeployment.IonicLiquidator.address,
        IonicLiquidatorArtifact.abi,
        this.provider
      ) as ILiquidator,
      FeeDistributor: new Contract(
        this.chainDeployment.FeeDistributor.address,
        FeeDistributorArtifact.abi,
        this.provider
      ) as FeeDistributor,
      IonicFlywheelLensRouter: new Contract(
        this.chainDeployment.IonicFlywheelLensRouter.address,
        IonicFlywheelLensRouterArtifact.abi,
        this.provider
      ) as IonicFlywheelLensRouter,
      AddressesProvider: new Contract(
        this.chainDeployment.AddressesProvider.address,
        AddressesProviderArtifact.abi,
        this.provider
      ) as AddressesProvider,
      ...this._contracts
    };
  }

  setSigner(signer: Signer) {
    this._provider = signer.provider as SupportedProvider;
    this._signer = signer;

    return this;
  }

  removeSigner(provider: SupportedProvider) {
    this._provider = provider;
    this._signer = null;

    return this;
  }

  constructor(signerOrProvider: SignerOrProvider, chainConfig: ChainConfig, logger: Logger = console) {
    this.logger = logger;
    if (!signerOrProvider) throw Error("No Provider or Signer");

    if (SignerWithAddress.isSigner(signerOrProvider) || Signer.isSigner(signerOrProvider)) {
      this._provider = signerOrProvider.provider as any;
      this._signer = signerOrProvider;
    } else if (JsonRpcProvider.isProvider(signerOrProvider) || Web3Provider.isProvider(signerOrProvider)) {
      this._provider = signerOrProvider;
      this._signer = signerOrProvider.getSigner ? signerOrProvider.getSigner() : null;
    } else {
      this.logger.warn(`Incompatible Provider or Signer: signerOrProvider`);
      throw Error("Signer or Provider not compatible");
    }

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
    closeFactor: BigNumber,
    liquidationIncentive: BigNumber,
    priceOracle: string, // Contract address
    whitelist: string[] // An array of whitelisted addresses
  ): Promise<[string, string, string, number?]> {
    try {
      // Deploy Comptroller implementation if necessary
      const implementationAddress = this.chainDeployment.Comptroller.address;

      // Register new pool with PoolDirectory
      const contract = this.contracts.PoolDirectory.connect(this.signer);

      const deployTx = await contract.deployPool(
        poolName,
        implementationAddress,
        new utils.AbiCoder().encode(["address"], [this.chainDeployment.FeeDistributor.address]),
        enforceWhitelist,
        closeFactor,
        liquidationIncentive,
        priceOracle
      );
      const deployReceipt = await deployTx.wait();
      this.logger.info(`Deployment of pool ${poolName} succeeded!`, deployReceipt.status);

      let poolId: number | undefined;
      try {
        // Latest Event is PoolRegistered which includes the poolId
        const registerEvent = deployReceipt.events?.pop();
        poolId =
          registerEvent && registerEvent.args && registerEvent.args[0]
            ? (registerEvent.args[0] as BigNumber).toNumber()
            : undefined;
      } catch (e) {
        this.logger.warn("Unable to retrieve pool ID from receipt events", e);
      }
      const [, existingPools] = await contract.callStatic.getActivePools();
      // Compute Unitroller address
      const addressOfSigner = await this.signer.getAddress();
      const poolAddress = getPoolAddress(
        addressOfSigner,
        poolName,
        existingPools.length,
        this.chainDeployment.FeeDistributor.address,
        this.chainDeployment.PoolDirectory.address
      );

      // Accept admin status via Unitroller
      const unitroller = getPoolUnitroller(poolAddress, this.signer);
      const acceptTx = await unitroller._acceptAdmin();
      const acceptReceipt = await acceptTx.wait();
      this.logger.info(`Accepted admin status for admin: ${acceptReceipt.status}`);

      // Whitelist
      this.logger.info(`enforceWhitelist: ${enforceWhitelist}`);
      if (enforceWhitelist) {
        const comptroller = getPoolComptroller(poolAddress, this.signer);

        // Was enforced by pool deployment, now just add addresses
        const whitelistTx = await comptroller._setWhitelistStatuses(whitelist, Array(whitelist.length).fill(true));
        const whitelistReceipt = await whitelistTx.wait();
        this.logger.info(`Whitelist updated: ${whitelistReceipt.status}`);
      }

      return [poolAddress, implementationAddress, priceOracle, poolId];
    } catch (error) {
      throw Error(`Deployment of new ionic pool failed:  ${error instanceof Error ? error.message : error}`);
    }
  }

  async identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      AnkrBNBInterestRateModel: AnkrBNBInterestRateModel,
      AnkrFTMInterestRateModel: AnkrFTMInterestRateModel,
      AdjustableJumpRateModel: AdjustableJumpRateModel,
      AdjustableAnkrBNBIrm: AdjustableAnkrBNBIrm
    };
    const runtimeBytecodeHash = utils.keccak256(await this.provider.getCode(interestRateModelAddress));

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

  async getInterestRateModel(assetAddress: string): Promise<InterestRateModel> {
    // Get interest rate model address from asset address
    const assetContract = getContract(
      assetAddress,
      CTokenFirstExtensionArtifact.abi,
      this.provider
    ) as CTokenFirstExtension;
    const interestRateModelAddress: string = await assetContract.callStatic.interestRateModel();

    const interestRateModel = await this.identifyInterestRateModel(interestRateModelAddress);
    if (!interestRateModel) {
      throw Error(`No Interest Rate Model found for asset: ${assetAddress}`);
    }
    await interestRateModel.init(interestRateModelAddress, assetAddress, this.provider);
    return interestRateModel;
  }

  getPriceOracle(oracleAddress: string): string {
    let oracle = this.availableOracles.find((o) => this.chainDeployment[o].address === oracleAddress);

    if (!oracle) {
      oracle = "Unrecognized Oracle";
    }

    return oracle;
  }

  getEIP20TokenInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, EIP20InterfaceArtifact.abi, signerOrProvider) as EIP20Interface;
  }

  getUnitrollerInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, UnitrollerArtifact.abi, signerOrProvider) as Unitroller;
  }

  getPoolDirectoryInstance(signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(this.chainDeployment.PoolDirectory.address, PoolDirectoryArtifact.abi, signerOrProvider);
  }

  getErc4626PluginInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, IonicERC4626Artifact.abi, signerOrProvider) as IonicERC4626;
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

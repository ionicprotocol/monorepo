import { LogLevel } from "@ethersproject/logger";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import {
  ChainAddresses,
  ChainConfig,
  ChainDeployment,
  ChainParams,
  DeployedPlugins,
  FundingStrategyContract,
  InterestRateModel,
  RedemptionStrategyContract,
  SupportedAsset,
  SupportedChains,
} from "@ionicprotocol/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, Signer, utils } from "ethers";

import CTokenFirstExtensionABI from "../../abis/CTokenFirstExtension";
import EIP20InterfaceABI from "../../abis/EIP20Interface";
import FuseFeeDistributorABI from "../../abis/FuseFeeDistributor";
import FusePoolDirectoryABI from "../../abis/FusePoolDirectory";
import FusePoolLensABI from "../../abis/FusePoolLens";
import FusePoolLensSecondaryABI from "../../abis/FusePoolLensSecondary";
import FuseSafeLiquidatorABI from "../../abis/FuseSafeLiquidator";
import IonicERC4626ABI from "../../abis/MidasERC4626";
import IonicFlywheelLensRouterABI from "../../abis/MidasFlywheelLensRouter";
import UnitrollerABI from "../../abis/Unitroller";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { EIP20Interface } from "../../typechain/EIP20Interface";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { FusePoolLens } from "../../typechain/FusePoolLens";
import { FusePoolLensSecondary } from "../../typechain/FusePoolLensSecondary";
import { FuseSafeLiquidator } from "../../typechain/FuseSafeLiquidator";
import { MidasERC4626 as IonicERC4626 } from "../../typechain/MidasERC4626";
import { MidasFlywheelLensRouter as IonicFlywheelLensRouter } from "../../typechain/MidasFlywheelLensRouter";
import { Unitroller } from "../../typechain/Unitroller";
import { withAsset } from "../modules/Asset";
import { withConvertMantissa } from "../modules/ConvertMantissa";
import { withCreateContracts } from "../modules/CreateContracts";
import { withFlywheel } from "../modules/Flywheel";
import { withFundOperations } from "../modules/FundOperations";
import { withFusePoolLens } from "../modules/FusePoolLens";
import { withFusePools } from "../modules/FusePools";
import { withLeverage } from "../modules/Leverage";
import { ChainLiquidationConfig } from "../modules/liquidation/config";
import { withSafeLiquidator } from "../modules/liquidation/SafeLiquidator";
import { withVaults } from "../modules/Vaults";

import { CTOKEN_ERROR_CODES } from "./config";
import AdjustableAnkrBNBIrm from "./irm/AdjustableAnkrBNBIrm";
import AdjustableJumpRateModel from "./irm/AdjustableJumpRateModel";
import AnkrBNBInterestRateModel from "./irm/AnkrBNBInterestRateModel";
import AnkrFTMInterestRateModel from "./irm/AnkrFTMInterestRateModel";
import JumpRateModel from "./irm/JumpRateModel";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";
import { getContract, getPoolAddress, getPoolComptroller, getPoolUnitroller } from "./utils";

utils.Logger.setLogLevel(LogLevel.OFF);

export type SupportedProvider = JsonRpcProvider | Web3Provider;
export type SupportedSigners = Signer | SignerWithAddress;
export type SignerOrProvider = SupportedSigners | SupportedProvider;
export type StaticContracts = {
  FuseFeeDistributor: FuseFeeDistributor;
  IonicFlywheelLensRouter: IonicFlywheelLensRouter;
  FusePoolDirectory: FusePoolDirectory;
  FusePoolLens: FusePoolLens;
  FusePoolLensSecondary: FusePoolLensSecondary;
  FuseSafeLiquidator: FuseSafeLiquidator;
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
  public redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] };
  public fundingStrategies: { [token: string]: [FundingStrategyContract, string] };

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
      FusePoolDirectory: new Contract(
        this.chainDeployment.FusePoolDirectory.address,
        FusePoolDirectoryABI,
        this.provider
      ) as FusePoolDirectory,
      FusePoolLens: new Contract(
        this.chainDeployment.FusePoolLens.address,
        FusePoolLensABI,
        this.provider
      ) as FusePoolLens,
      FusePoolLensSecondary: new Contract(
        this.chainDeployment.FusePoolLensSecondary.address,
        FusePoolLensSecondaryABI,
        this.provider
      ) as FusePoolLensSecondary,
      FuseSafeLiquidator: new Contract(
        this.chainDeployment.FuseSafeLiquidator.address,
        FuseSafeLiquidatorABI,
        this.provider
      ) as FuseSafeLiquidator,
      FuseFeeDistributor: new Contract(
        this.chainDeployment.FuseFeeDistributor.address,
        FuseFeeDistributorABI,
        this.provider
      ) as FuseFeeDistributor,
      IonicFlywheelLensRouter: new Contract(
        this.chainDeployment.MidasFlywheelLensRouter.address,
        IonicFlywheelLensRouterABI,
        this.provider
      ) as IonicFlywheelLensRouter,
      ...this._contracts,
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

      // Register new pool with FusePoolDirectory
      const contract = this.contracts.FusePoolDirectory.connect(this.signer);

      const deployTx = await contract.deployPool(
        poolName,
        implementationAddress,
        new utils.AbiCoder().encode(["address"], [this.chainDeployment.FuseFeeDistributor.address]),
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
        this.chainDeployment.FuseFeeDistributor.address,
        this.chainDeployment.FusePoolDirectory.address
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
      throw Error(`Deployment of new Fuse pool failed:  ${error instanceof Error ? error.message : error}`);
    }
  }

  async identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      WhitePaperInterestRateModel: WhitePaperInterestRateModel,
      AnkrBNBInterestRateModel: AnkrBNBInterestRateModel,
      AnkrFTMInterestRateModel: AnkrFTMInterestRateModel,
      AdjustableJumpRateModel: AdjustableJumpRateModel,
      AdjustableAnkrBNBIrm: AdjustableAnkrBNBIrm,
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
    const assetContract = getContract(assetAddress, CTokenFirstExtensionABI, this.provider) as CTokenFirstExtension;
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
    return new Contract(address, EIP20InterfaceABI, signerOrProvider) as EIP20Interface;
  }

  getUnitrollerInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, UnitrollerABI, signerOrProvider) as Unitroller;
  }

  getFusePoolDirectoryInstance(signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(this.chainDeployment.FusePoolDirectory.address, FusePoolDirectoryABI, signerOrProvider);
  }

  getErc4626PluginInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, IonicERC4626ABI, signerOrProvider) as IonicERC4626;
  }
}

const IonicBaseWithModules = withFusePoolLens(
  withFundOperations(
    withSafeLiquidator(
      withFusePools(
        withAsset(withFlywheel(withVaults(withLeverage(withCreateContracts(withConvertMantissa(IonicBase))))))
      )
    )
  )
);
export class IonicSdk extends IonicBaseWithModules {}
export default IonicSdk;

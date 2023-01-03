import { LogLevel } from "@ethersproject/logger";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import {
  ChainAddresses,
  ChainConfig,
  ChainDeployment,
  ChainParams,
  DelegateContractName,
  DeployedPlugins,
  FundingStrategyContract,
  InterestRateModel,
  IrmConfig,
  OracleConfig,
  RedemptionStrategyContract,
  SupportedAsset,
  SupportedChains,
} from "@midas-capital/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, Signer, utils } from "ethers";

import CTokenInterfaceABI from "../../abis/CTokenInterface";
import EIP20InterfaceABI from "../../abis/EIP20Interface";
import MidasERC4626ABI from "../../abis/MidasERC4626";
import UnitrollerABI from "../../abis/Unitroller";
import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { CErc20PluginDelegate } from "../../typechain/CErc20PluginDelegate";
import { CErc20PluginRewardsDelegate } from "../../typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { EIP20Interface } from "../../typechain/EIP20Interface";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { FusePoolLens } from "../../typechain/FusePoolLens";
import { FusePoolLensSecondary } from "../../typechain/FusePoolLensSecondary";
import { FuseSafeLiquidator } from "../../typechain/FuseSafeLiquidator";
import { MidasERC4626 } from "../../typechain/MidasERC4626";
import { MidasFlywheelLensRouter } from "../../typechain/MidasFlywheelLensRouter";
import { Unitroller } from "../../typechain/Unitroller";
import ARTIFACTS, { irmConfig, oracleConfig } from "../Artifacts";
import { withAsset } from "../modules/Asset";
import { withConvertMantissa } from "../modules/ConvertMantissa";
import { withCreateContracts } from "../modules/CreateContracts";
import { withFlywheel } from "../modules/Flywheel";
import { withFundOperations } from "../modules/FundOperations";
import { withFusePoolLens } from "../modules/FusePoolLens";
import { withFusePools } from "../modules/FusePools";
import { ChainLiquidationConfig } from "../modules/liquidation/config";
import { withSafeLiquidator } from "../modules/liquidation/SafeLiquidator";

import { CTOKEN_ERROR_CODES } from "./config";
import AdjustableJumpRateModel from "./irm/AdjustableJumpRateModel";
import AnkrBNBInterestRateModel from "./irm/AnkrBnbInterestRateModel";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2";
import JumpRateModel from "./irm/JumpRateModel";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";
import { getContract, getPoolAddress, getPoolComptroller, getPoolUnitroller } from "./utils";

utils.Logger.setLogLevel(LogLevel.OFF);

type ComptrollerWithExtensions = Comptroller & ComptrollerFirstExtension;
type CTokenWithExtensions = CErc20Delegate & CTokenFirstExtension;

export type SupportedProvider = JsonRpcProvider | Web3Provider;
export type SupportedSigners = Signer | SignerWithAddress;
export type SignerOrProvider = SupportedSigners | SupportedProvider;
export type StaticContracts = {
  FuseFeeDistributor: FuseFeeDistributor;
  MidasFlywheelLensRouter: MidasFlywheelLensRouter;
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

export class MidasBase {
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
    return MidasBase.isSupportedSigner(signerOrProvider) || MidasBase.isSupportedProvider(signerOrProvider);
  }

  public _contracts: StaticContracts | undefined;
  public chainConfig: ChainConfig;
  public availableOracles: Array<string>;
  public availableIrms: Array<string>;
  public chainId: SupportedChains;
  public chainDeployment: ChainDeployment;
  public oracles: OracleConfig;
  public chainSpecificAddresses: ChainAddresses;
  public chainSpecificParams: ChainParams;
  public irms: IrmConfig;
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
        this.chainDeployment.FusePoolDirectory.abi,
        this.provider
      ) as FusePoolDirectory,
      FusePoolLens: new Contract(
        this.chainDeployment.FusePoolLens.address,
        this.chainDeployment.FusePoolLens.abi,
        this.provider
      ) as FusePoolLens,
      FusePoolLensSecondary: new Contract(
        this.chainDeployment.FusePoolLensSecondary.address,
        this.chainDeployment.FusePoolLensSecondary.abi,
        this.provider
      ) as FusePoolLensSecondary,
      FuseSafeLiquidator: new Contract(
        this.chainDeployment.FuseSafeLiquidator.address,
        this.chainDeployment.FuseSafeLiquidator.abi,
        this.provider
      ) as FuseSafeLiquidator,
      FuseFeeDistributor: new Contract(
        this.chainDeployment.FuseFeeDistributor.address,
        this.chainDeployment.FuseFeeDistributor.abi,
        this.provider
      ) as FuseFeeDistributor,
      MidasFlywheelLensRouter: new Contract(
        this.chainDeployment.MidasFlywheelLensRouter.address,
        this.chainDeployment.MidasFlywheelLensRouter.abi,
        this.provider
      ) as MidasFlywheelLensRouter,
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

    this.availableIrms = chainConfig.irms.filter((o) => {
      if (ARTIFACTS[o] === undefined || this.chainDeployment[o] === undefined) {
        this.logger.warn(`Irm ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
    this.availableOracles = chainConfig.oracles.filter((o) => {
      if (ARTIFACTS[o] === undefined || this.chainDeployment[o] === undefined) {
        this.logger.warn(`Oracle ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
    this.oracles = oracleConfig(this.chainDeployment, ARTIFACTS, this.availableOracles);
    this.irms = irmConfig(this.chainDeployment, ARTIFACTS, this.availableIrms);
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
      throw Error(`Deployment of new Fuse pool failed:  ${error.message ? error.message : error}`);
    }
  }

  async identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      DAIInterestRateModelV2: DAIInterestRateModelV2,
      WhitePaperInterestRateModel: WhitePaperInterestRateModel,
      AnkrBNBInterestRateModel: AnkrBNBInterestRateModel,
      JumpRateModel_MIMO_002_004_4_08: JumpRateModel,
      JumpRateModel_JARVIS_002_004_4_08: JumpRateModel,
      AdjustableJumpRateModel_PSTAKE_WBNB: AdjustableJumpRateModel,
      AdjustableJumpRateModel_MIXBYTES_XCDOT: AdjustableJumpRateModel,
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
    const assetContract = getContract(assetAddress, CTokenInterfaceABI, this.provider);
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

  identifyInterestRateModelName = (irmAddress: string): string | null => {
    let irmName: string | null = null;
    for (const [name, irm] of Object.entries(this.irms)) {
      if (irm.address === irmAddress) {
        irmName = name;
        return irmName;
      }
    }
    return irmName;
  };

  getComptrollerInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    const comptrollerABI: Array<object> = this.chainDeployment.Comptroller.abi;

    if (this.chainDeployment.ComptrollerFirstExtension) {
      comptrollerABI.push(...this.chainDeployment.ComptrollerFirstExtension.abi);
    }

    return new Contract(address, comptrollerABI, signerOrProvider) as ComptrollerWithExtensions;
  }

  getCTokenInstance(address: string, signerOrProvider = this.provider) {
    const ctokenABI: Array<object> = this.chainDeployment[DelegateContractName.CErc20Delegate].abi;

    if (this.chainDeployment.CTokenFirstExtension) {
      ctokenABI.push(...this.chainDeployment.CTokenFirstExtension.abi);
    }

    return new Contract(address, ctokenABI, signerOrProvider) as CTokenWithExtensions;
  }

  getCErc20PluginRewardsInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(
      address,
      this.chainDeployment[DelegateContractName.CErc20PluginRewardsDelegate].abi,
      signerOrProvider
    ) as CErc20PluginRewardsDelegate;
  }

  getCErc20PluginInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(
      address,
      this.chainDeployment[DelegateContractName.CErc20PluginDelegate].abi,
      signerOrProvider
    ) as CErc20PluginDelegate;
  }

  getEIP20RewardTokenInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, EIP20InterfaceABI, signerOrProvider) as EIP20Interface;
  }

  getUnitrollerInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, UnitrollerABI, signerOrProvider) as Unitroller;
  }

  getFusePoolDirectoryInstance(signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(
      this.chainDeployment.FusePoolDirectory.address,
      this.chainDeployment.FusePoolDirectory.abi,
      signerOrProvider
    );
  }

  getMidasErc4626PluginInstance(address: string, signerOrProvider: SignerOrProvider = this.provider) {
    return new Contract(address, MidasERC4626ABI, signerOrProvider) as MidasERC4626;
  }
}

const MidasBaseWithModules = withFusePoolLens(
  withFundOperations(
    withSafeLiquidator(withFusePools(withAsset(withFlywheel(withCreateContracts(withConvertMantissa(MidasBase))))))
  )
);
export default class MidasSdk extends MidasBaseWithModules {}

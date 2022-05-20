// Ethers
import { BigNumber, constants, Contract, ContractFactory, utils } from "ethers";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";

// ABIs
import uniswapV3PoolAbiSlim from "./abi/UniswapV3Pool.slim.json";

// InterestRate Models
import JumpRateModel from "./irm/JumpRateModel";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";

import Deployments from "../../deployments.json";
import ComptrollerArtifact from "../../lib/contracts/out/Comptroller.sol/Comptroller.json";
import UnitrollerArtifact from "../../lib/contracts/out/Unitroller.sol/Unitroller.json";
import ERC20Artifact from "../../lib/contracts/out/ERC20.sol/ERC20.json";
import CEtherDelegateArtifact from "../../lib/contracts/out/CEtherDelegate.sol/CEtherDelegate.json";
import CEtherDelegatorArtifact from "../../lib/contracts/out/CEtherDelegator.sol/CEtherDelegator.json";
import CErc20DelegateArtifact from "../../lib/contracts/out/CErc20Delegate.sol/CErc20Delegate.json";
import CErc20PluginDelegateArtifact from "../../lib/contracts/out/CErc20PluginDelegate.sol/CErc20PluginDelegate.json";
import CErc20PluginRewardsDelegateArtifact from "../../lib/contracts/out/CErc20PluginRewardsDelegate.sol/CErc20PluginRewardsDelegate.json";
import CErc20DelegatorArtifact from "../../lib/contracts/out/CErc20Delegator.sol/CErc20Delegator.json";
import CTokenInterfacesArtifact from "../../lib/contracts/out/CTokenInterfaces.sol/CTokenInterface.json";
import EIP20InterfaceArtifact from "../../lib/contracts/out/EIP20Interface.sol/EIP20Interface.json";
import RewardsDistributorDelegatorArtifact from "../../lib/contracts/out/RewardsDistributorDelegator.sol/RewardsDistributorDelegator.json";
import RewardsDistributorDelegateArtifact from "../../lib/contracts/out/RewardsDistributorDelegate.sol/RewardsDistributorDelegate.json";
import FuseFlywheelCoreArtifact from "../../lib/contracts/out/FuseFlywheelCore.sol/FuseFlywheelCore.json";
import FlywheelStaticRewardsArtifact from "../../lib/contracts/out/FlywheelStaticRewards.sol/FlywheelStaticRewards.json";

// Oracle Artifacts
import MasterPriceOracleArtifact from "../../lib/contracts/out/MasterPriceOracle.sol/MasterPriceOracle.json";
import UniswapTwapPriceOracleV2Artifact from "../../lib/contracts/out/UniswapTwapPriceOracleV2.sol/UniswapTwapPriceOracleV2.json";
import SimplePriceOracleArtifact from "../../lib/contracts/out/SimplePriceOracle.sol/SimplePriceOracle.json";
import ChainlinkPriceOracleV2Artifact from "../../lib/contracts/out/ChainlinkPriceOracleV2.sol/ChainlinkPriceOracleV2.json";
import PreferredPriceOracleArtifact from "../../lib/contracts/out/PreferredPriceOracle.sol/PreferredPriceOracle.json";

// IRM Artifacts
import JumpRateModelArtifact from "../../lib/contracts/out/JumpRateModel.sol/JumpRateModel.json";
import DAIInterestRateModelV2Artifact from "../../lib/contracts/out/DAIInterestRateModelV2.sol/DAIInterestRateModelV2.json";
import WhitePaperInterestRateModelArtifact from "../../lib/contracts/out/WhitePaperInterestRateModel.sol/WhitePaperInterestRateModel.json";

// Types
import {
  Artifact,
  Artifacts,
  AssetPluginConfig,
  ChainAddresses,
  ChainDeployment,
  ChainRedemptionStrategy,
  ChainSpecificAddresses,
  InterestRateModel,
  InterestRateModelConf,
  InterestRateModelParams,
  OracleConf,
  SupportedAsset,
} from "../types";
import { RedemptionStrategy, SupportedChains } from "../enums";
import { CTOKEN_ERROR_CODES, JUMP_RATE_MODEL_CONF, WHITE_PAPER_RATE_MODEL_CONF } from "./config";
import {
  chainOracles,
  chainSpecificAddresses,
  irmConfig,
  oracleConfig,
  chainPluginConfig,
  chainLiquidationDefaults,
  chainSupportedAssets,
  chainRedemptionStrategies,
} from "../chainConfig";

// SDK modules
import { withRewardsDistributor } from "../modules/RewardsDistributor";
import { withFundOperations } from "../modules/FundOperations";
import { withFusePoolLens } from "../modules/FusePoolLens";
import { withFlywheel } from "../modules/Flywheel";
import { withFusePools } from "../modules/FusePools";
import { withAsset } from "../modules/Asset";
import { withCreateContracts } from "../modules/CreateContracts";

// Typechain
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";
import { FusePoolLens } from "../../lib/contracts/typechain/FusePoolLens";
import { FusePoolLensSecondary } from "../../lib/contracts/typechain/FusePoolLensSecondary";
import { FuseSafeLiquidator } from "../../lib/contracts/typechain/FuseSafeLiquidator";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";
import { withSafeLiquidator } from "../modules/liquidation/SafeLiquidator";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FuseFlywheelLensRouter } from "../../lib/contracts/typechain/FuseFlywheelLensRouter.sol";
import { ChainLiquidationConfig } from "../modules/liquidation/config";

type OracleConfig = {
  [contractName: string]: {
    artifact: Artifact;
    address: string;
  };
};

type IrmConfig = OracleConfig;

export class FuseBase {
  // public methods
  static CTOKEN_ERROR_CODES = CTOKEN_ERROR_CODES;
  public provider: JsonRpcProvider | Web3Provider;

  public contracts: {
    FuseFeeDistributor: FuseFeeDistributor;
    FusePoolDirectory: FusePoolDirectory;
    FusePoolLens: FusePoolLens;
    FusePoolLensSecondary: FusePoolLensSecondary;
    FuseSafeLiquidator: FuseSafeLiquidator;
    [contractName: string]: Contract;
  };
  public JumpRateModelConf: InterestRateModelConf;
  public WhitePaperRateModelConf: InterestRateModelConf;

  public availableOracles: Array<string>;
  public chainId: SupportedChains;
  public chainDeployment: ChainDeployment;
  public oracles: OracleConfig;
  public chainSpecificAddresses: ChainAddresses;
  public artifacts: Artifacts;
  public irms: IrmConfig;
  public chainPlugins: AssetPluginConfig;
  public liquidationConfig: ChainLiquidationConfig;
  public supportedAssets: SupportedAsset[];
  public redemptionStrategies: { [token: string]: RedemptionStrategy };

  // public methods

  constructor(
    web3Provider: JsonRpcProvider | Web3Provider,
    chainId: SupportedChains,
    chainDeployment?: ChainDeployment
  ) {
    this.provider = web3Provider;
    this.chainId = chainId;
    this.chainDeployment =
      chainDeployment ??
      (Deployments[chainId.toString()] &&
        Deployments[chainId.toString()][Object.keys(Deployments[chainId.toString()])[0]]?.contracts);
    if (!this.chainDeployment) {
      throw new Error(`Chain deployment not found or provided for chainId ${chainId}`);
    }
    this.WhitePaperRateModelConf = WHITE_PAPER_RATE_MODEL_CONF(chainId);
    this.JumpRateModelConf = JUMP_RATE_MODEL_CONF(chainId);

    this.contracts = {
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
    };
    if (this.chainDeployment.FuseFlywheelLensRouter) {
      this.contracts["FuseFlywheelLensRouter"] = new Contract(
        this.chainDeployment.FuseFlywheelLensRouter?.address || constants.AddressZero,
        this.chainDeployment.FuseFlywheelLensRouter.abi,
        this.provider
      ) as FuseFlywheelLensRouter;
    } else {
      console.warn(`FuseFlywheelLensRouter not deployed to chain ${this.chainId}`);
    }
    this.artifacts = {
      CErc20Delegate: CErc20DelegateArtifact,
      CErc20PluginDelegate: CErc20PluginDelegateArtifact,
      CErc20PluginRewardsDelegate: CErc20PluginRewardsDelegateArtifact,
      CErc20Delegator: CErc20DelegatorArtifact,
      CEtherDelegate: CEtherDelegateArtifact,
      CEtherDelegator: CEtherDelegatorArtifact,
      ChainlinkPriceOracleV2: ChainlinkPriceOracleV2Artifact,
      Comptroller: ComptrollerArtifact,
      CTokenInterfaces: CTokenInterfacesArtifact,
      DAIInterestRateModelV2: DAIInterestRateModelV2Artifact,
      EIP20Interface: EIP20InterfaceArtifact,
      ERC20: ERC20Artifact,
      JumpRateModel: JumpRateModelArtifact,
      MasterPriceOracle: MasterPriceOracleArtifact,
      UniswapTwapPriceOracleV2: UniswapTwapPriceOracleV2Artifact,
      PreferredPriceOracle: PreferredPriceOracleArtifact,
      RewardsDistributorDelegator: RewardsDistributorDelegatorArtifact,
      RewardsDistributorDelegate: RewardsDistributorDelegateArtifact,
      SimplePriceOracle: SimplePriceOracleArtifact,
      Unitroller: UnitrollerArtifact,
      WhitePaperInterestRateModel: WhitePaperInterestRateModelArtifact,
      FuseFlywheelCore: FuseFlywheelCoreArtifact,
      FlywheelStaticRewards: FlywheelStaticRewardsArtifact,
    };

    this.irms = irmConfig(this.chainDeployment, this.artifacts);
    this.availableOracles = chainOracles[chainId].filter((o) => {
      if (this.artifacts[o] === undefined || this.chainDeployment[o] === undefined) {
        console.warn(`Oracle ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
    this.oracles = oracleConfig(this.chainDeployment, this.artifacts, this.availableOracles);

    this.chainSpecificAddresses = chainSpecificAddresses[chainId];
    this.liquidationConfig = chainLiquidationDefaults[chainId];
    this.supportedAssets = chainSupportedAssets[chainId];
    this.chainPlugins = chainPluginConfig[chainId];
    this.redemptionStrategies = chainRedemptionStrategies[chainId];
  }

  async deployPool(
    poolName: string,
    enforceWhitelist: boolean,
    closeFactor: BigNumber,
    liquidationIncentive: BigNumber,
    priceOracle: string, // Contract address
    priceOracleConf: OracleConf,
    options: { from: string }, // We might need to add sender as argument. Getting address from options will collide with the override arguments in ethers contract method calls. It doesn't take address.
    whitelist: string[] // An array of whitelisted addresses
  ): Promise<[string, string, string, number?]> {
    try {
      // Deploy Comptroller implementation if necessary
      let implementationAddress = this.chainDeployment.Comptroller.address;

      if (!implementationAddress) {
        const comptrollerContract = new ContractFactory(
          this.artifacts.Comptroller.abi,
          this.artifacts.Comptroller.bytecode.object,
          this.provider.getSigner(options.from)
        );
        const deployedComptroller = await comptrollerContract.deploy();
        implementationAddress = deployedComptroller.address;
      }

      // Register new pool with FusePoolDirectory
      const contract = this.contracts.FusePoolDirectory.connect(this.provider.getSigner(options.from));
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
      console.log(`Deployment of pool ${poolName} succeeded!`, deployReceipt.status);

      let poolId: number | undefined;
      try {
        // Latest Event is PoolRegistered which includes the poolId
        const registerEvent = deployReceipt.events?.pop();
        poolId =
          registerEvent && registerEvent.args && registerEvent.args[0]
            ? (registerEvent.args[0] as BigNumber).toNumber()
            : undefined;
      } catch (e) {
        console.warn("Unable to retrieve pool ID from receipt events", e);
      }

      // Compute Unitroller address
      const saltsHash = utils.solidityKeccak256(
        ["address", "string", "uint"],
        [options.from, poolName, deployReceipt.blockNumber]
      );
      const byteCodeHash = utils.keccak256(
        this.artifacts.Unitroller.bytecode.object +
          new utils.AbiCoder().encode(["address"], [this.chainDeployment.FuseFeeDistributor.address]).slice(2)
      );

      const poolAddress = utils.getCreate2Address(
        this.chainDeployment.FusePoolDirectory.address,
        saltsHash,
        byteCodeHash
      );

      // Accept admin status via Unitroller
      const unitroller = new Contract(
        poolAddress,
        this.artifacts.Unitroller.abi,
        this.provider.getSigner(options.from)
      );
      const acceptTx = await unitroller._acceptAdmin();
      const acceptReceipt = await acceptTx.wait();
      console.log("Accepted admin status for admin:", acceptReceipt.status);

      // Whitelist
      console.log("enforceWhitelist: ", enforceWhitelist);
      if (enforceWhitelist) {
        let comptroller = new Contract(
          poolAddress,
          this.artifacts.Comptroller.abi,
          this.provider.getSigner(options.from)
        );

        // Was enforced by pool deployment, now just add addresses
        const whitelistTx = await comptroller._setWhitelistStatuses(whitelist, Array(whitelist.length).fill(true));
        const whitelistReceipt = await whitelistTx.wait();
        console.log("Whitelist updated:", whitelistReceipt.status);
      }

      return [poolAddress, implementationAddress, priceOracle, poolId];
    } catch (error: any) {
      throw Error("Deployment of new Fuse pool failed: " + (error.message ? error.message : error));
    }
  }

  async deployInterestRateModel(options: any, model?: string, conf?: InterestRateModelParams): Promise<string> {
    // Default model = JumpRateModel
    if (!model) {
      model = "JumpRateModel";
    }

    // Get deployArgs
    let deployArgs: any[] = [];
    let modelArtifact: Artifact;

    switch (model) {
      case "JumpRateModel":
        if (!conf) conf = JUMP_RATE_MODEL_CONF(this.chainId).interestRateModelParams;
        deployArgs = [
          conf.blocksPerYear,
          conf.baseRatePerYear,
          conf.multiplierPerYear,
          conf.jumpMultiplierPerYear,
          conf.kink,
        ];
        modelArtifact = this.artifacts.JumpRateModel;
        break;
      case "WhitePaperInterestRateModel":
        if (!conf) conf = WHITE_PAPER_RATE_MODEL_CONF(this.chainId).interestRateModelParams;
        conf = {
          blocksPerYear: conf.blocksPerYear,
          baseRatePerYear: conf.baseRatePerYear,
          multiplierPerYear: conf.multiplierPerYear,
        };
        deployArgs = [conf.blocksPerYear, conf.baseRatePerYear, conf.multiplierPerYear];
        modelArtifact = this.artifacts.WhitePaperInterestRateModel;
        break;
      default:
        throw "IRM model specified is invalid";
    }

    // Deploy InterestRateModel
    const interestRateModelContract = new ContractFactory(
      modelArtifact.abi,
      modelArtifact.bytecode.object,
      this.provider.getSigner(options.from)
    );

    const deployedInterestRateModel = await interestRateModelContract.deploy(...deployArgs);
    return deployedInterestRateModel.address;
  }

  async identifyPriceOracle(priceOracleAddress: string) {
    // Get PriceOracle type from runtime bytecode hash
    const runtimeBytecodeHash = utils.keccak256(await this.provider.getCode(priceOracleAddress));

    for (const [name, oracle] of Object.entries(this.oracles)) {
      if (oracle.artifact && oracle.artifact.bytecode) {
        const value = utils.keccak256(oracle.artifact.bytecode.object);
        if (runtimeBytecodeHash == value) return name;
      } else {
        console.warn(`No Artifact or Bytecode found for enabled Oracle: ${name}`);
      }
    }
    return null;
  }

  async identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel | null> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      DAIInterestRateModelV2: DAIInterestRateModelV2,
      WhitePaperInterestRateModel: WhitePaperInterestRateModel,
    };
    const runtimeBytecodeHash = utils.keccak256(await this.provider.getCode(interestRateModelAddress));

    let irmModel = null;

    for (const irm of Object.values(interestRateModels)) {
      if (runtimeBytecodeHash === irm.RUNTIME_BYTECODE_HASH) {
        irmModel = new irm();
        break;
      }
    }
    return irmModel;
  }

  async getInterestRateModel(assetAddress: string): Promise<any | undefined | null> {
    // Get interest rate model address from asset address
    const assetContract = new Contract(assetAddress, this.artifacts.CTokenInterfaces.abi, this.provider);
    const interestRateModelAddress: string = await assetContract.callStatic.interestRateModel();

    const interestRateModel = await this.identifyInterestRateModel(interestRateModelAddress);
    if (interestRateModel === null) {
      return null;
    }
    await interestRateModel.init(interestRateModelAddress, assetAddress, this.provider);
    return interestRateModel;
  }

  async getPriceOracle(oracleAddress: string): Promise<string | null> {
    // Get price oracle contract name from runtime bytecode hash
    const runtimeBytecodeHash = utils.keccak256(await this.provider.getCode(oracleAddress));
    for (const [name, oracle] of Object.entries(this.oracles)) {
      const value = utils.keccak256(oracle.artifact.deployedBytecode.object);
      if (runtimeBytecodeHash === value) return name;
    }
    return null;
  }

  async checkCardinality(uniswapV3Pool: string) {
    const uniswapV3PoolContract = new Contract(uniswapV3Pool, uniswapV3PoolAbiSlim);
    return (await uniswapV3PoolContract.methods.slot0().call()).observationCardinalityNext < 64;
  }

  async primeUniswapV3Oracle(uniswapV3Pool, options) {
    const uniswapV3PoolContract = new Contract(uniswapV3Pool, uniswapV3PoolAbiSlim);
    await uniswapV3PoolContract.methods.increaseObservationCardinalityNext(64).send(options);
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

  getComptrollerInstance(comptrollerAddress: string, options: { from: string }) {
    return new Contract(
      comptrollerAddress,
      this.artifacts.Comptroller.abi,
      this.provider.getSigner(options.from)
    ) as Comptroller;
  }
}

const FuseBaseWithModules = withFlywheel(
  withFusePoolLens(
    withRewardsDistributor(
      withFundOperations(withSafeLiquidator(withFusePools(withAsset(withCreateContracts(FuseBase)))))
    )
  )
);

export default class Fuse extends FuseBaseWithModules {}

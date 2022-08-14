import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import {
  ChainAddresses,
  ChainConfig,
  ChainDeployment,
  ChainParams,
  DelegateContractName,
  DeployedPlugins,
  InterestRateModel,
  InterestRateModelConf,
  IrmConfig,
  OracleConfig,
  RedemptionStrategyContract,
  SupportedAsset,
  SupportedChains,
} from "@midas-capital/types";
import { BigNumber, constants, Contract, utils } from "ethers";

import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CErc20PluginDelegate } from "../../lib/contracts/typechain/CErc20PluginDelegate";
import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";
import { FuseFlywheelLensRouter } from "../../lib/contracts/typechain/FuseFlywheelLensRouter.sol";
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";
import { FusePoolLens } from "../../lib/contracts/typechain/FusePoolLens";
import { FusePoolLensSecondary } from "../../lib/contracts/typechain/FusePoolLensSecondary";
import { FuseSafeLiquidator } from "../../lib/contracts/typechain/FuseSafeLiquidator";
import { ARTIFACTS, Artifacts, irmConfig, oracleConfig } from "../Artifacts";
import { withAsset } from "../modules/Asset";
import { withConvertMantissa } from "../modules/ConvertMantissa";
import { withCreateContracts } from "../modules/CreateContracts";
import { withFlywheel } from "../modules/Flywheel";
import { withFundOperations } from "../modules/FundOperations";
import { withFusePoolLens } from "../modules/FusePoolLens";
import { withFusePools } from "../modules/FusePools";
import { ChainLiquidationConfig } from "../modules/liquidation/config";
import { withSafeLiquidator } from "../modules/liquidation/SafeLiquidator";

import uniswapV3PoolAbiSlim from "./abi/UniswapV3Pool.slim.json";
import {
  ANKR_BNB_INTEREST_RATE_MODEL_CONF,
  CTOKEN_ERROR_CODES,
  JUMP_RATE_MODEL_CONF,
  WHITE_PAPER_RATE_MODEL_CONF,
} from "./config";
import AnkrBNBInterestRateModel from "./irm/AnkrBnbInterestRateModel";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2";
import JumpRateModel from "./irm/JumpRateModel";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";
import { getContract, getPoolAddress, getPoolComptroller, getPoolUnitroller } from "./utils";

export class MidasBase {
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
  public AnkrBNBInterestRateModelConf: InterestRateModelConf;
  public WhitePaperInterestRateModelConf: InterestRateModelConf;

  public chainConfig: ChainConfig;
  public availableOracles: Array<string>;
  public availableIrms: Array<string>;
  public chainId: SupportedChains;
  public chainDeployment: ChainDeployment;
  public oracles: OracleConfig;
  public chainSpecificAddresses: ChainAddresses;
  public chainSpecificParams: ChainParams;
  public artifacts: Artifacts;
  public irms: IrmConfig;
  public deployedPlugins: DeployedPlugins;
  public liquidationConfig: ChainLiquidationConfig;
  public supportedAssets: SupportedAsset[];
  public redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] };

  constructor(web3Provider: JsonRpcProvider | Web3Provider, chainConfig: ChainConfig) {
    this.provider = web3Provider;
    this.chainConfig = chainConfig;
    this.chainId = chainConfig.chainId;
    this.chainDeployment = chainConfig.chainDeployments;
    this.WhitePaperInterestRateModelConf = WHITE_PAPER_RATE_MODEL_CONF(chainConfig.specificParams.blocksPerYear);
    this.JumpRateModelConf = JUMP_RATE_MODEL_CONF(chainConfig.specificParams.blocksPerYear);
    this.AnkrBNBInterestRateModelConf = ANKR_BNB_INTEREST_RATE_MODEL_CONF(chainConfig.specificParams.blocksPerYear);

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
    this.artifacts = ARTIFACTS;

    this.availableIrms = chainConfig.irms.filter((o) => {
      if (this.artifacts[o] === undefined || this.chainDeployment[o] === undefined) {
        console.warn(`Irm ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
    this.availableOracles = chainConfig.oracles.filter((o) => {
      if (this.artifacts[o] === undefined || this.chainDeployment[o] === undefined) {
        console.warn(`Oracle ${o} not deployed to chain ${this.chainId}`);
        return false;
      }
      return true;
    });
    this.oracles = oracleConfig(this.chainDeployment, this.artifacts, this.availableOracles);
    this.irms = irmConfig(this.chainDeployment, this.artifacts, this.availableIrms);

    this.chainSpecificAddresses = chainConfig.chainAddresses;
    this.chainSpecificParams = chainConfig.specificParams;
    this.liquidationConfig = chainConfig.liquidationDefaults;
    this.supportedAssets = chainConfig.assets;
    this.deployedPlugins = chainConfig.deployedPlugins;
    this.redemptionStrategies = chainConfig.redemptionStrategies;
  }

  async deployPool(
    poolName: string,
    enforceWhitelist: boolean,
    closeFactor: BigNumber,
    liquidationIncentive: BigNumber,
    priceOracle: string, // Contract address
    options: { from: string }, // We might need to add sender as argument. Getting address from options will collide with the override arguments in ethers contract method calls. It doesn't take address.
    whitelist: string[] // An array of whitelisted addresses
  ): Promise<[string, string, string, number?]> {
    try {
      // Deploy Comptroller implementation if necessary
      const implementationAddress = this.chainDeployment.Comptroller.address;

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
      const existingPools = await contract.callStatic.getAllPools();
      // Compute Unitroller address
      const poolAddress = getPoolAddress(
        options.from,
        poolName,
        existingPools.length,
        this.chainDeployment.FuseFeeDistributor.address,
        this.chainDeployment.FusePoolDirectory.address
      );

      // Accept admin status via Unitroller
      const unitroller = getPoolUnitroller(poolAddress, this.provider.getSigner(options.from));
      const acceptTx = await unitroller._acceptAdmin();
      const acceptReceipt = await acceptTx.wait();
      console.log("Accepted admin status for admin:", acceptReceipt.status);

      // Whitelist
      console.log("enforceWhitelist: ", enforceWhitelist);
      if (enforceWhitelist) {
        const comptroller = getPoolComptroller(poolAddress, this.provider.getSigner(options.from));

        // Was enforced by pool deployment, now just add addresses
        const whitelistTx = await comptroller._setWhitelistStatuses(whitelist, Array(whitelist.length).fill(true));
        const whitelistReceipt = await whitelistTx.wait();
        console.log("Whitelist updated:", whitelistReceipt.status);
      }

      return [poolAddress, implementationAddress, priceOracle, poolId];
    } catch (error) {
      throw Error("Deployment of new Fuse pool failed: " + (error.message ? error.message : error));
    }
  }

  async identifyInterestRateModel(interestRateModelAddress: string): Promise<InterestRateModel> {
    // Get interest rate model type from runtime bytecode hash and init class
    const interestRateModels: { [key: string]: any } = {
      JumpRateModel: JumpRateModel,
      DAIInterestRateModelV2: DAIInterestRateModelV2,
      WhitePaperInterestRateModel: WhitePaperInterestRateModel,
      AnkrBNBInterestRateModel: AnkrBNBInterestRateModel,
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
    const assetContract = getContract(assetAddress, this.artifacts.CTokenInterface.abi, this.provider);
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

  getComptrollerInstance(address: string, options: { from: string }) {
    return new Contract(address, this.artifacts.Comptroller.abi, this.provider.getSigner(options.from)) as Comptroller;
  }

  getCTokenInstance(address: string) {
    return new Contract(
      address,
      this.chainDeployment[DelegateContractName.CErc20Delegate].abi,
      this.provider.getSigner()
    ) as CErc20Delegate;
  }

  getCErc20PluginRewardsInstance(address: string) {
    return new Contract(
      address,
      this.chainDeployment[DelegateContractName.CErc20PluginRewardsDelegate].abi,
      this.provider.getSigner()
    ) as CErc20PluginRewardsDelegate;
  }

  getCErc20PluginInstance(address: string) {
    return new Contract(
      address,
      this.chainDeployment[DelegateContractName.CErc20PluginDelegate].abi,
      this.provider.getSigner()
    ) as CErc20PluginDelegate;
  }
}

const MidasBaseWithModules = withFusePoolLens(
  withFundOperations(
    withSafeLiquidator(withFusePools(withAsset(withFlywheel(withCreateContracts(withConvertMantissa(MidasBase))))))
  )
);
export default class MidasSdk extends MidasBaseWithModules {}

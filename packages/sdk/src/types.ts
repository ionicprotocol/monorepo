import { BigNumber, BigNumberish, Overrides, providers } from "ethers";

import { DelegateContractName, LiquidationStrategy, RedemptionStrategy, SupportedChains } from "./enums";
import { FuseBase } from "./Fuse";
import DAIInterestRateModelV2 from "./Fuse/irm/DAIInterestRateModelV2";
import JumpRateModel from "./Fuse/irm/JumpRateModel";
import WhitePaperInterestRateModel from "./Fuse/irm/WhitePaperInterestRateModel";
export { Artifacts, Artifact } from "./Artifacts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GConstructor<T> = new (...args: any[]) => T;
export type FuseBaseConstructor = GConstructor<FuseBase>;

export type TxOptions = Overrides & { from?: string | Promise<string> };

export type MinifiedContracts = {
  [key: string]: {
    abi?: Array<object>;
    bin?: any;
  };
};

export type MinifiedCompoundContracts = {
  [key: string]: {
    abi?: Array<object>;
    bytecode?: any;
  };
};

export type MinifiedOraclesContracts = MinifiedCompoundContracts;

export interface InterestRateModel {
  init(
    interestRateModelAddress: string,
    assetAddress: string,
    provider: providers.Web3Provider | providers.JsonRpcProvider
  ): Promise<void>;

  _init(
    interestRateModelAddress: string,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    fuseFeeMantissa: BigNumberish,
    provider: providers.Web3Provider | providers.JsonRpcProvider
  ): Promise<void>;

  __init(
    baseRatePerBlock: BigNumberish,
    multiplierPerBlock: BigNumberish,
    jumpMultiplierPerBlock: BigNumberish,
    kink: BigNumberish,
    reserveFactorMantissa: BigNumberish,
    adminFeeMantissa: BigNumberish,
    fuseFeeMantissa: BigNumberish
  ): Promise<void>;

  getBorrowRate(utilizationRate: BigNumber): BigNumber;

  getSupplyRate(utilizationRate: BigNumber): BigNumber;
}

export type ChainDeployment = {
  [contractName: string]: {
    abi: any;
    address: string;
  };
};

export type InterestRateModelType = JumpRateModel | DAIInterestRateModelV2 | WhitePaperInterestRateModel;

export interface MarketConfig {
  underlying: string;
  comptroller: string;
  adminFee: number;
  collateralFactor: number;
  interestRateModel: string; // TODO: Use an Enum here, similar to Contract, resolve address inside the function
  reserveFactor: number;
  plugin?: MarketPluginConfig;

  // REFACTOR below:
  bypassPriceFeedCheck: boolean;
  fuseFeeDistributor: string; // TODO: Remove this? We should always use our Fee Distributor!
  symbol: string; // TODO: Same as name
  name: string; // TODO: Make optional, should be set inside SDK for default value mToken or so
}

interface AbstractPluginConfig {
  cTokenContract: DelegateContractName;
  strategyName: string;
  strategyCode: string;
  strategyAddress: string;
}

export interface StandardPluginConfig extends AbstractPluginConfig {
  cTokenContract: DelegateContractName.CErc20PluginDelegate;
}

type RewardFlywheel = {
  address: string;
  rewardToken: string;
};

export interface RewardsPluginConfig extends AbstractPluginConfig {
  cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate;
  flywheels: RewardFlywheel[];
}

export type MarketPluginConfig = StandardPluginConfig | RewardsPluginConfig;

export type RewardsDistributorConfig = {
  rewardsDistributor: string;
  rewardToken: string;
};

export type OracleConf = {
  anchorPeriod?: any;
  tokenConfigs?: any;
  canAdminOverwrite?: any;
  isPublic?: any;
  maxSecondsBeforePriceIsStale?: any;
  chainlinkPriceOracle?: any;
  secondaryPriceOracle?: any;
  reporter?: any;
  anchorMantissa?: any;
  isSecure?: any;
  useRootOracle?: any;
  underlyings?: any;
  sushiswap?: any;
  oracles?: any;
  admin?: any;
  rootOracle?: any;
  uniswapV2Factory?: any;
  baseToken?: any;
  uniswapV3Factory?: any;
  feeTier?: any;
  defaultOracle?: any;
};

export type InterestRateModelParams = {
  blocksPerYear?: BigNumber;
  baseRatePerYear?: string;
  multiplierPerYear?: string;
  jumpMultiplierPerYear?: string;
  kink?: string;
};

export type InterestRateModelConf = {
  interestRateModel?: string;
  interestRateModelParams?: InterestRateModelParams;
};

export interface FuseAsset {
  cToken: string;
  plugin?: string;

  borrowBalance: BigNumber;
  supplyBalance: BigNumber;
  liquidity: BigNumber;

  membership: boolean;

  underlyingName: string;
  underlyingSymbol: string;
  underlyingToken: string;
  underlyingDecimals: BigNumber;
  underlyingPrice: BigNumber;
  underlyingBalance: BigNumber;

  collateralFactor: BigNumber;
  reserveFactor: BigNumber;

  adminFee: BigNumber;
  fuseFee: BigNumber;

  borrowRatePerBlock: BigNumber;
  supplyRatePerBlock: BigNumber;

  totalBorrow: BigNumber;
  totalSupply: BigNumber;

  isBorrowPaused: boolean;
  isSupplyPaused: boolean;
}

export interface NativePricedFuseAsset extends FuseAsset {
  supplyBalanceNative: number;
  borrowBalanceNative: number;

  totalSupplyNative: number;
  totalBorrowNative: number;

  liquidityNative: number;
  utilization: number;
}

export interface FusePoolData {
  id: number;
  assets: NativePricedFuseAsset[];
  creator: string;
  comptroller: string;
  name: string;
  totalLiquidityNative: number;
  totalSuppliedNative: number;
  totalBorrowedNative: number;
  totalSupplyBalanceNative: number;
  totalBorrowBalanceNative: number;
  blockPosted: BigNumber;
  timestampPosted: BigNumber;
  underlyingTokens: string[];
  underlyingSymbols: string[];
  whitelistedAdmin: boolean;
  utilization: number;
}

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  blockPosted: number;
  timestampPosted: number;
}

export type SupportedAsset = {
  symbol: string;
  underlying: string;
  name: string;
  decimals: number;
  simplePriceOracleAssetPrice?: BigNumber;
};

export type AssetPluginConfig = {
  [asset: string]: MarketPluginConfig[];
};

export type ChainPlugins = {
  [chain in SupportedChains]: AssetPluginConfig;
};

export type ChainLiquidationDefaults = {
  [chain in SupportedChains]: {
    SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
    SUPPORTED_INPUT_CURRENCIES: Array<string>;
    LIQUIDATION_STRATEGY: LiquidationStrategy;
    MINIMUM_PROFIT_NATIVE: BigNumber;
  };
};

export type ChainRedemptionStrategy = {
  [chain in SupportedChains]: {
    [token: string]: RedemptionStrategy;
  };
};

export type ChainOracles = {
  [chain in SupportedChains]: string[];
};

export type ChainSpecificParams = {
  [chain in SupportedChains]: {
    blocksPerYear: BigNumber;
  };
};

export type ChainAddresses = {
  W_TOKEN: string;
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
  UNISWAP_V2_ROUTER: string;
  UNISWAP_V2_FACTORY: string;
  PAIR_INIT_HASH: string;
};

export type ChainSpecificAddresses = {
  [chain in SupportedChains]: ChainAddresses;
};

export type ChainSupportedAssets = {
  [chain in SupportedChains]: SupportedAsset[];
};

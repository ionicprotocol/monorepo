import { BigNumber, BigNumberish, providers } from "ethers";

import JumpRateModel from "./irm/JumpRateModel";
import DAIInterestRateModelV2 from "./irm/DAIInterestRateModelV2";
import WhitePaperInterestRateModel from "./irm/WhitePaperInterestRateModel";
import { FuseBase } from ".";
import { SupportedChains } from "../chainConfig";
import { DelegateContractName } from "./enums";
import { LiquidationStrategy } from "../modules/liquidation/config";

export type GConstructor<T = { sayHello(msg: string): void }> = new (
  ...args: any[]
) => T;
export type FuseBaseConstructor = GConstructor<FuseBase>;

export type MinifiedContracts = {
  [key: string]: {
    abi?: any;
    bin?: any;
  };
};

export type MinifiedCompoundContracts = {
  [key: string]: {
    abi?: any;
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
export type Artifact = {
  abi: any;
  bytecode: {
    object: string;
    sourceMap: string;
    linkReferences: any;
  };
  deployedBytecode: {
    object: string;
    sourceMap: string;
    linkReferences: any;
  };
};

export type Artifacts = {
  [contractName: string]: Artifact;
};

export type ChainDeployment = {
  [contractName: string]: {
    abi: any;
    address: string;
  };
};

export type InterestRateModelType =
  | JumpRateModel
  | DAIInterestRateModelV2
  | WhitePaperInterestRateModel;

export type cERC20Conf = {
  delegateContractName?: DelegateContractName;
  underlying: string; // underlying ERC20
  comptroller: string; // Address of the comptroller
  fuseFeeDistributor: string;
  interestRateModel: string; // Address of the IRM
  initialExchangeRateMantissa?: BigNumber; // Initial exchange rate scaled by 1e18
  name: string; // ERC20 name of this token
  symbol: string; // ERC20 Symbol
  admin: string; // Address of the admin
  collateralFactor: number;
  reserveFactor: number;
  adminFee: number;
  bypassPriceFeedCheck: boolean;
  plugin?: string;
  rewardsDistributor?: string;
  rewardToken?: string;
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
}

export interface FusePool {
  name: string;
  creator: string;
  comptroller: string;
  blockPosted: number;
  timestampPosted: number;
}

export type PluginConfig = {
  strategyName: string;
  strategyAddress: string;
  dynamicFlywheel?: {
    address: string;
    rewardToken: string;
  };
};

export type SupportedAsset = {
  symbol: string;
  underlying: string;
  name: string;
  decimals: number;
  simplePriceOracleAssetPrice?: BigNumber;
};

export type AssetPluginConfig = {
  [asset: string]: PluginConfig[];
};

export type ChainPlugins = {
  [chain in SupportedChains]: AssetPluginConfig;
};

export type ChainLiquidationDeafaults = {
  [chain in SupportedChains]: {
    SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
    SUPPORTED_INPUT_CURRENCIES: Array<string>;
    LIQUIDATION_STRATEGY: LiquidationStrategy;
    MINIMUM_PROFIT_NATIVE: BigNumber;
  };
};

export type ChainRedemptionStrategy = {
  [chain in SupportedChains]: {
    [token: string]: string;
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

export type ChainSpecificAddresses = {
  [chain in SupportedChains]: {
    W_TOKEN: string;
    W_TOKEN_USD_CHAINLINK_PRICE_FEED: string;
    UNISWAP_V2_ROUTER: string;
    UNISWAP_V2_FACTORY: string;
    PAIR_INIT_HASH: string;
  };
};

export type ChainSupportedAssets = {
  [chain in SupportedChains]: SupportedAsset[];
};

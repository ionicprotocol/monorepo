import { SupportedAsset } from "@ionicprotocol/types";
import { Address, Hash } from "viem";
import { HardhatRuntimeEnvironment, RunTaskFunction } from "hardhat/types";

export type TokenPair = {
  token: Address;
  baseToken: Address;
};

export type UniswapOracleDeployConfig = {
  token: Address;
  baseToken: Address;
  pair: Address;
  minPeriod: number;
  deviationThreshold: string;
};

export type ConcentratedLiquidityOracleConfig = {
  assetAddress: Address;
  poolAddress: Address;
  twapWindow: bigint; // In seconds
  baseToken: string;
};

export type BalancerSwapTokenLiquidatorData = {
  poolAddress: Address;
  inputToken: Address;
  outputToken: Address;
};

export type ChainDeployConfig = {
  uniswap: {
    uniswapV2RouterAddress: Address;
    uniswapV2FactoryAddress: Address;
    uniswapV3FactoryAddress?: Address;
    uniswapOracleInitialDeployTokens: Array<UniswapOracleDeployConfig>;
    pairInitHashCode?: Hash;
    hardcoded: { name: string; symbol: string; address: Address }[];
    uniswapData: { lpName: string; lpSymbol: string; lpDisplayName: string }[];
    uniswapOracleLpTokens?: Array<Address>;
    flashSwapFee: number;
    uniswapV3SwapRouter?: Address;
    uniswapV3Quoter?: Address;
  };
  wtoken: Address;
  nativeTokenUsdChainlinkFeed?: Hash;
  nativeTokenName: string;
  nativeTokenSymbol: string;
  stableToken?: Address;
  wBTCToken?: Address;
  blocksPerYear: number;
  dynamicFlywheels?: DynamicFlywheelConfig[];
  cgId: string;
  veION: veIONConfig;
  ION: Address;
};

export type veIONConfig = {
  lpTokens: Address[];
  lpStakingStrategies: string[];
  lpStakingWalletImplementations: string[];
  lpExternalStakingContracts: Address[];
  lpTokenWhitelistStatuses: boolean[];
  lpTokenTypes: number[];
  minimumLockAmounts: bigint[];
  minimumLockDuration: number;
  maxEarlyWithdrawFee: bigint;
  ionicAeroVeloPool?: Address;
  aeroVoting?: Address;
  aeroVotingBoost?: bigint;
  veAERO?: Address;
  maxVotingNum?: number;
};

export type DynamicFlywheelConfig = {
  name: string;
  rewardToken: string;
  cycleLength: number;
  flywheelToReplace?: string;
};

export type PluginConfig = {
  name: string;
  strategy: string;
  underlying: string;
  otherParams?: string[];
  flywheelAddresses?: string[];
  flywheelIndices?: number[];
  market: string;
};

export type ChainlinkAsset = {
  symbol: string;
  aggregator: Hash;
  feedBaseCurrency: ChainlinkFeedBaseCurrency;
};

export type DiaAsset = {
  symbol: string;
  underlying: string;
  feed: string;
  key: string;
};

export type UmbrellaAsset = {
  underlying: Address;
  feed: Hash;
};
export type PythAsset = UmbrellaAsset;
export type Api3Asset = UmbrellaAsset;
export type RedStoneAsset = {
  underlying: Address;
};

export type SolidlyLpAsset = {
  lpTokenAddress: Address;
};

export type GammaLpAsset = SolidlyLpAsset;

export type ERC4626Asset = {
  assetAddress: Address;
};

export type CurvePoolConfig = {
  lpToken: Address;
  pool: Address;
  underlyings: Address[];
};

export type CurveV2PoolConfig = {
  lpToken: Address;
  pool: Address;
};

export enum ChainlinkFeedBaseCurrency {
  ETH,
  USD
}

export type CurveV2OracleConfig = {
  token: Address;
  pool: Address;
};

export type ChainDeployFnParams = {
  viem: HardhatRuntimeEnvironment["viem"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  run: RunTaskFunction;
};

export type LiquidatorDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  chainId: number;
};

export type LiquidatorConfigFnParams = {
  contractName: string;
  viem: HardhatRuntimeEnvironment["viem"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  chainId: number;
};

export type AddressesProviderConfigFnParams = {
  viem: HardhatRuntimeEnvironment["viem"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  chainId: number;
  deployConfig: ChainDeployConfig;
};

export type LiquidatorsRegistryConfigFnParams = {
  viem: HardhatRuntimeEnvironment["viem"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  chainId: number;
};

export type IrmDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  chainId: number;
};

export type ChainlinkDeployFnParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
  chainlinkAssets: ChainlinkAsset[];
  deployConfig: ChainDeployConfig;
  namePostfix?: string;
};

export type AerodromeDeployFnParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
  pricesContract: Address;
  deployConfig: ChainDeployConfig;
};

export type DiaDeployFnParams = ChainDeployFnParams & {
  diaAssets: DiaAsset[];
  deployConfig: ChainDeployConfig;
  diaNativeFeed?: Omit<DiaAsset, "symbol" | "underlying">;
};

export type UmbrellaDeployFnParams = ChainDeployFnParams & {
  registryAddress: Address;
  umbrellaAssets: UmbrellaAsset[];
  deployConfig: ChainDeployConfig;
  nativeUsdFeed: Hash;
};

export type Api3DeployFnParams = ChainDeployFnParams & {
  usdToken: Address;
  nativeTokenUsdFeed: Hash;
  api3Assets: Api3Asset[];
  deployConfig: ChainDeployConfig;
};

export type PythDeployFnParams = ChainDeployFnParams & {
  pythAddress: Address;
  usdToken: Address;
  pythAssets: PythAsset[];
  deployConfig: ChainDeployConfig;
  nativeTokenUsdFeed: Hash;
};

export type RedStoneDeployFnParams = ChainDeployFnParams & {
  redStoneAddress: Address;
  redStoneAssets: RedStoneAsset[];
  deployConfig: ChainDeployConfig;
};

export type UniswapDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type SolidlyDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  solidlyLps: SolidlyLpAsset[];
};

export enum GammaUnderlyingSwap {
  UNISWAP,
  ALGEBRA
}

export type GammaDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  gammaLps: GammaLpAsset[];
  swap: GammaUnderlyingSwap;
};

export type SolidlyOracleAssetConfig = {
  underlying: string;
  poolAddress: string;
  baseToken: string;
};

export type SolidlyOracleDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  supportedBaseTokens: string[];
  assets: SolidlyOracleAssetConfig[];
};

export type ConcentratedLiquidityDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  concentratedLiquidityOracleTokens: ConcentratedLiquidityOracleConfig[];
};

export type CurveLpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  curvePools: CurvePoolConfig[];
};

export type SaddleLpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  saddlePools: CurvePoolConfig[];
};

export type CurveV2LpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  curveV2Pools: CurveV2PoolConfig[];
};

export type CurveV2OracleLpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  curveV2OraclePools: CurveV2OracleConfig[];
};

export type WstEthOracleFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  assets: SupportedAsset[];
};

export type FuseFlywheelDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type Erc4626OracleFnParams = ChainDeployFnParams & {
  erc4626Assets: ERC4626Asset[];
};

export type ChainlinkSpecificParams = {
  aggregator: Address;
  feedBaseCurrency: ChainlinkFeedBaseCurrency;
};

export type PythSpecificParams = {
  feed: Address;
};

export type VelodromeSpecificParams = {
  pricesContract: Address;
};

export enum OracleTypes {
  ChainlinkPriceOracleV2 = "ChainlinkPriceOracleV2",
  API3PriceOracle = "API3PriceOracle",
  FixedNativePriceOracle = "FixedNativePriceOracle",
  MasterPriceOracle = "MasterPriceOracle",
  SimplePriceOracle = "SimplePriceOracle",
  UniswapLpTokenPriceOracle = "UniswapLpTokenPriceOracle",
  UniswapTwapPriceOracleV2 = "UniswapTwapPriceOracleV2",
  UniswapV3PriceOracle = "UniswapV3PriceOracle",
  ERC4626Oracle = "ERC4626Oracle",
  PythPriceOracle = "PythPriceOracle",
  RedstoneAdapterPriceOracle = "RedstoneAdapterPriceOracle",
  RedstoneAdapterWrsETHPriceOracle = "RedstoneAdapterWrsETHPriceOracle",
  VelodromePriceOracle = "VelodromePriceOracle",
  AerodromePriceOracle = "AerodromePriceOracle"
}

export type ChainAddresses = {
  W_TOKEN: Address;
  STABLE_TOKEN: Address;
  W_BTC_TOKEN: Address;
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: Hash;
  UNISWAP_V2_ROUTER: Address;
  UNISWAP_V2_FACTORY: Address;
  UNISWAP_V3_ROUTER?: Address;
  PAIR_INIT_HASH?: Hash;
  UNISWAP_V3?: {
    FACTORY: Address;
    PAIR_INIT_HASH?: Hash;
    QUOTER_V2?: Address;
  };
  ALGEBRA_SWAP_ROUTER?: Address;
  SOLIDLY_SWAP_ROUTER?: Address;
  GAMMA_ALGEBRA_SWAP_ROUTER?: Address;
  GAMMA_ALGEBRA_UNI_PROXY?: Address;
  GAMMA_UNISWAP_V3_SWAP_ROUTER?: Address;
  GAMMA_UNISWAP_V3_UNI_PROXY?: Address;
  EXPRESS_RELAY?: Address;
};

export type ChainConfig = {
  chainId: number;
  chainAddresses: ChainAddresses;
  assets: SupportedAsset[];
  irms: IrmTypes[];
  liquidationDefaults: LiquidationDefaults;
  oracles: OracleTypes[];
  specificParams: ChainParams;
  deployedPlugins: DeployedPlugins;
  redemptionStrategies: RedemptionStrategy[];
  fundingStrategies: FundingStrategy[];
  chainDeployments: ChainDeployment;
  leveragePairs: LeveragePoolConfig[];
};

export enum IrmTypes {
  JumpRateModel = "JumpRateModel"
}

export type LiquidationDefaults = {
  DEFAULT_ROUTER: string;
  ASSET_SPECIFIC_ROUTER: {
    [token: string]: string;
  };
  SUPPORTED_OUTPUT_CURRENCIES: Array<Address>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: bigint;
  LIQUIDATION_INTERVAL_SECONDS: number;
};

export enum LiquidationStrategy {
  DEFAULT = "DEFAULT",
  UNISWAP = "UNISWAP"
}

export type RedemptionStrategy = {
  inputToken: string;
  outputToken: string;
  strategy: RedemptionStrategyContract;
};

export enum RedemptionStrategyContract {
  UniswapLpTokenLiquidator = "UniswapLpTokenLiquidator",
  UniswapV2LiquidatorFunder = "UniswapV2LiquidatorFunder",
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder",
  ERC4626Liquidator = "ERC4626Liquidator",
  AlgebraSwapLiquidator = "AlgebraSwapLiquidator",
  SolidlySwapLiquidator = "SolidlySwapLiquidator",
  AaveTokenLiquidator = "AaveTokenLiquidator",
  KimUniV2Liquidator = "KimUniV2Liquidator"
}

export type SupportedPlugin = null;
export type DeployedPlugins = {
  [pluginAddress: string]: SupportedPlugin;
};

export type ChainParams = {
  blocksPerYear: number;
  cgId: string;
  metadata: ChainMetadata;
};

type RpcUrls = {
  http: string[];
  webSocket?: string[];
};

type BlockExplorer = {
  name: string;
  url: string;
};

export interface ChainMetadata {
  chainIdHex: string;
  shortName: string;
  name: string;
  img: string;
  uniswapV3Routers?: {
    [key: string]: {
      [key: string]: string | null;
    };
  };
  uniswapV3Fees?: {
    [key: string]: {
      [key: string]: number;
    };
  };
  rpcUrls: {
    [key: string]: RpcUrls;
    default: RpcUrls;
    public: RpcUrls;
  };
  blockExplorerUrls: {
    [key: string]: BlockExplorer;
    default: BlockExplorer;
  };
  nativeCurrency: {
    symbol: string;
    name: string;
  };
  wrappedNativeCurrency: {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    color: string;
    overlayTextColor: string;
    logoURL: string;
  };
  testnet?: boolean | undefined;
}

export type FundingStrategy = {
  inputToken: string;
  outputToken: string;
  strategy: FundingStrategyContract;
};

export enum FundingStrategyContract {
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder"
}

export type ChainDeployment = {
  [contractName: string]: {
    abi?: any;
    address: string;
  };
};

export type LeveragePoolConfig = {
  pool: Address;
  pairs: LeveragePair[];
};

export type LeveragePair = {
  borrow: Address;
  collateral: Address;
};

export interface MarketConfig {
  underlying: Address;
  comptroller: Address;
  adminFee: number;
  collateralFactor: number;
  interestRateModel: Address;
  reserveFactor: number;
  plugin?: Address;
  bypassPriceFeedCheck: boolean;
  feeDistributor: Address;
  symbol: string;
  name: string;
}

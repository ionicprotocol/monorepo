import { assetSymbols, SupportedAsset } from "@ionicprotocol/types";
import { BigNumber } from "ethers";
import { HardhatRuntimeEnvironment, RunTaskFunction } from "hardhat/types";

export enum ChainlinkFeedBaseCurrency {
  ETH,
  USD
}

export type TokenPair = {
  token: string;
  baseToken: string;
};

export type UniswapOracleDeployConfig = {
  token: string;
  baseToken: string;
  pair: string;
  minPeriod: number;
  deviationThreshold: string;
};

export type ConcentratedLiquidityOracleConfig = {
  assetAddress: string;
  poolAddress: string;
  twapWindow: BigNumber; // In seconds
  baseToken: string;
};

export type BalancerSwapTokenLiquidatorData = {
  poolAddress: string;
  inputToken: string;
  outputToken: string;
};

export type ChainDeployConfig = {
  uniswap: {
    uniswapV2RouterAddress: string;
    uniswapV2FactoryAddress: string;
    uniswapV3FactoryAddress?: string;
    uniswapOracleInitialDeployTokens: Array<UniswapOracleDeployConfig>;
    pairInitHashCode?: string;
    hardcoded: { name: string; symbol: string; address: string }[];
    uniswapData: { lpName: string; lpSymbol: string; lpDisplayName: string }[];
    uniswapOracleLpTokens?: Array<string>;
    flashSwapFee: number;
  };
  wtoken: string;
  nativeTokenUsdChainlinkFeed?: string;
  nativeTokenName: string;
  nativeTokenSymbol: string;
  stableToken?: string;
  wBTCToken?: string;
  blocksPerYear: number;
  dynamicFlywheels?: DynamicFlywheelConfig[];
  cgId: string;
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
  aggregator: string;
  feedBaseCurrency: ChainlinkFeedBaseCurrency;
};

export type DiaAsset = {
  symbol: string;
  underlying: string;
  feed: string;
  key: string;
};

export type UmbrellaAsset = {
  underlying: string;
  feed: string;
};
export type PythAsset = UmbrellaAsset;
export type Api3Asset = UmbrellaAsset;

export type WombatAsset = {
  symbol: string;
  underlying: string;
};

export type GelatoGUniAsset = {
  vaultAddress: string;
};

export type BalancerLpAsset = {
  lpTokenAddress: string;
};

export type BalancerStableLpAsset = BalancerLpAsset;
export type BalancerLinearPoolAsset = BalancerLpAsset;

export type BalancerRateProviderAsset = {
  tokenAddress: string;
  baseToken: string;
  rateProviderAddress: string;
};

export type SolidlyLpAsset = {
  lpTokenAddress: string;
};

export type GammaLpAsset = SolidlyLpAsset;

export type ERC4626Asset = {
  assetAddress: string;
};

export type CurvePoolConfig = {
  lpToken: string;
  pool: string;
  underlyings: string[];
};

export type CurveV2PoolConfig = {
  lpToken: string;
  pool: string;
};

export type CurveV2OracleConfig = {
  token: string;
  pool: string;
};

export type ChainDeployFnParams = {
  ethers: HardhatRuntimeEnvironment["ethers"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  run: RunTaskFunction;
};

export type LiquidatorDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type LiquidatorConfigFnParams = {
  contractName: string;
  ethers: HardhatRuntimeEnvironment["ethers"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  chainId: number;
};

export type AddressesProviderConfigFnParams = {
  ethers: HardhatRuntimeEnvironment["ethers"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  chainId: number;
  deployConfig: ChainDeployConfig;
};

export type LiquidatorsRegistryConfigFnParams = {
  ethers: HardhatRuntimeEnvironment["ethers"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  chainId: number;
};

export type IrmDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type ChainlinkDeployFnParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
  chainlinkAssets: ChainlinkAsset[];
  deployConfig: ChainDeployConfig;
};

export type DiaDeployFnParams = ChainDeployFnParams & {
  diaAssets: DiaAsset[];
  deployConfig: ChainDeployConfig;
  diaNativeFeed?: Omit<DiaAsset, "symbol" | "underlying">;
};

export type UmbrellaDeployFnParams = ChainDeployFnParams & {
  registryAddress: string;
  umbrellaAssets: UmbrellaAsset[];
  deployConfig: ChainDeployConfig;
  nativeUsdFeed: string;
};

export type Api3DeployFnParams = ChainDeployFnParams & {
  usdToken: string;
  nativeTokenUsdFeed: string;
  api3Assets: Api3Asset[];
  deployConfig: ChainDeployConfig;
};

export type PythDeployFnParams = ChainDeployFnParams & {
  pythAddress: string;
  usdToken: string;
  pythAssets: PythAsset[];
  deployConfig: ChainDeployConfig;
  nativeTokenUsdFeed: string;
};

export type WombatDeployFnParams = ChainDeployFnParams & {
  wombatAssets: WombatAsset[];
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

export type BalancerLpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  balancerLpAssets: BalancerLpAsset[] | BalancerStableLpAsset[];
};

export type BalancerRateProviderFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  balancerRateProviderAssets: BalancerRateProviderAsset[];
};

export type BalancerLinearPoolFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  balancerLinerPoolAssets: BalancerLinearPoolAsset[];
};

export type FuseFlywheelDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type aXXXcDeployParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
  certificateAssetSymbol: assetSymbols.ankrBNB | assetSymbols.aFTMc | assetSymbols.aMATICc;
};

export type stkBNBOracleDeployParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
};

export type gelatoGUniPriceOracleDeployParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  gelatoAssets: GelatoGUniAsset[];
};

export type Erc4626OracleFnParams = ChainDeployFnParams & {
  erc4626Assets: ERC4626Asset[];
};

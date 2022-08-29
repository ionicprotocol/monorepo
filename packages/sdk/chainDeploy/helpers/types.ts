import { SupportedAsset } from "@midas-capital/types";
import { HardhatRuntimeEnvironment, RunTaskFunction } from "hardhat/types";

export enum ChainlinkFeedBaseCurrency {
  ETH,
  USD,
}

export type TokenPair = {
  token: string;
  baseToken: string;
};

export type ChainDeployConfig = {
  uniswap: {
    uniswapV2RouterAddress: string;
    uniswapV2FactoryAddress: string;
    uniswapOracleInitialDeployTokens: Array<TokenPair>;
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
  plugins?: PluginConfig[];
  cgId: string;
};

export type DynamicFlywheelConfig = {
  name: string;
  rewardToken: string;
  cycleLength: number;
};

export type PluginConfig = {
  name: string;
  strategy: string;
  underlying: string;
  otherParams?: string[];
  flywheelAddresses?: string[];
  flywheelIndices?: number[];
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

export type GelatoGUniAsset = {
  vaultAddress: string;
};

export type CurvePoolConfig = {
  lpToken: string;
  pool: string;
  underlyings: string[];
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
  ethers: HardhatRuntimeEnvironment["ethers"];
  getNamedAccounts: HardhatRuntimeEnvironment["getNamedAccounts"];
  chainId: string;
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

export type UniswapDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type CurveLpFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  curvePools: CurvePoolConfig[];
};

export type FuseFlywheelDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
};

export type Erc4626PluginDeployFnParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  dynamicFlywheels: Array<string>;
};

export type aBNBcDeployParams = ChainDeployFnParams & {
  assets: SupportedAsset[];
};

export type gelatoGUniPriceOracleDeployParams = ChainDeployFnParams & {
  deployConfig: ChainDeployConfig;
  gelatoAssets: GelatoGUniAsset[];
};

export type UniswapOracleV2ResolverPairParams = {
  pair: string;
  baseToken: string;
  minPeriod: number;
  deviationThreshold: number;
};

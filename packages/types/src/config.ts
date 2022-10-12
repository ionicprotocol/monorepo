import { BigNumber } from "ethers";

import { ChainDeployment } from "./chain";

export type OracleConfig = ChainDeployment;
export type IrmConfig = OracleConfig;

export interface MarketConfig {
  underlying: string;
  comptroller: string;
  adminFee: number;
  collateralFactor: number;
  interestRateModel: string; // TODO: Use an Enum here, similar to Contract, resolve address inside the function
  reserveFactor: number;
  // TODO we are not yet able to create a Plugin with a Market via the UI
  plugin?: string;

  // REFACTOR below:
  bypassPriceFeedCheck: boolean;
  fuseFeeDistributor: string; // TODO: Remove this? We should always use our Fee Distributor!
  symbol: string; // TODO: Same as name
  name: string; // TODO: Make optional, should be set inside SDK for default value mToken or so
}

export type RewardsDistributorConfig = {
  rewardsDistributor: string;
  rewardToken: string;
};

export type InterestRateModelParams = {
  blocksPerYear?: BigNumber;
  baseRatePerYear?: string;
  multiplierPerYear?: string;
  jumpMultiplierPerYear?: string;
  kink?: string;
  day?: number;
  abnbr?: string;
};

export type InterestRateModelConf = {
  interestRateModel?: string;
  interestRateModelParams?: InterestRateModelParams;
};

export enum Strategy {
  Beefy = "BeefyERC4626",
  Arrakis = "ArrakisERC4626",
  DotDot = "DotDotLpERC4626",
  Stella = "StellaLpERC4626",
  Bomb = "BombERC4626",
}

export interface PluginData {
  market: string;
  name: string;
  strategy?: Strategy;
  apyDocsUrl?: string;
  strategyDocsUrl?: string;
  underlying: string;
  otherParams?: any[];
}

export type DeployedPlugins = {
  [pluginAddress: string]: PluginData;
};

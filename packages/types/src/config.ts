import { Address } from "viem";

import { ChainDeployment } from "./chain";

export type OracleConfig = ChainDeployment;
export type IrmConfig = OracleConfig;

export interface MarketConfig {
  underlying: Address;
  comptroller: Address;
  adminFee: number;
  collateralFactor: number;
  interestRateModel: Address; // TODO: Use an Enum here, similar to Contract, resolve address inside the function
  reserveFactor: number;
  // TODO we are not yet able to create a Plugin with a Market via the UI
  plugin?: Address;

  // REFACTOR below:
  bypassPriceFeedCheck: boolean;
  feeDistributor: Address; // TODO: Remove this? We should always use our Fee Distributor!
  symbol: string; // TODO: Same as name
  name: string; // TODO: Make optional, should be set inside SDK for default value mToken or so
}

export type RewardsDistributorConfig = {
  rewardsDistributor: string;
  rewardToken: string;
};

export type InterestRateModelParams = {
  blocksPerYear?: bigint;
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

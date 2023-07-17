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
  feeDistributor: string; // TODO: Remove this? We should always use our Fee Distributor!
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

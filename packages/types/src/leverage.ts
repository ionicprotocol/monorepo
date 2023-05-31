import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface MarketRewardsInfoStructOutput {
  rewardSpeedPerSecondPerToken: BigNumber;
  rewardTokenPrice: BigNumber;
  formattedAPR: BigNumber;
  flywheel: string;
  rewardToken: string;
}
export interface LeveredPositionBorrowable {
  cToken: string;
  underlyingToken: string;
  symbol: string;
  rate: BigNumber;
  leveredPosition: string | undefined;
}

export interface LeveredPositionCollateral {
  cToken: string;
  underlyingToken: string;
  underlyingDecimals: BigNumber;
  symbol: string;
  supplyRatePerBlock: BigNumber;
  totalSupplied: BigNumber;
  pool: string;
  plugin?: string;
  reward?: {
    underlyingPrice: BigNumber;
    market: string;
    rewardsInfo: MarketRewardsInfoStructOutput[];
  };
}

export interface LeveredPosition {
  chainId: SupportedChains;
  collateral: LeveredPositionCollateral;
  borrowable: LeveredPositionBorrowable[];
}

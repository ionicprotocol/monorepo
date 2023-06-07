import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface MarketRewardsInfoStructOutput {
  rewardSpeedPerSecondPerToken: BigNumber;
  rewardTokenPrice: BigNumber;
  formattedAPR: BigNumber;
  flywheel: string;
  rewardToken: string;
}

export interface NewPositionBorrowable {
  cToken: string;
  underlyingToken: string;
  symbol: string;
  rate: BigNumber;
}
export interface OpenPositionBorrowable extends NewPositionBorrowable {
  position: string;
  isPositionClosed: boolean;
}

export interface LeveredCollateral {
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
  underlyingPrice: BigNumber;
}

export interface OpenPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: OpenPositionBorrowable;
}

export interface NewPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: NewPositionBorrowable[];
}

import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface MarketRewardsInfoStructOutput {
  rewardSpeedPerSecondPerToken: BigNumber;
  rewardTokenPrice: BigNumber;
  formattedAPR: BigNumber;
  flywheel: string;
  rewardToken: string;
}

export interface PositionCreationBorrowable {
  cToken: string;
  underlyingToken: string;
  symbol: string;
  rate: BigNumber;
}
export interface CreatedPositionBorrowable extends PositionCreationBorrowable {
  position: string;
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
}

export interface CreatedPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: CreatedPositionBorrowable;
}

export interface PositionCreation {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: PositionCreationBorrowable[];
}

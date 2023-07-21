import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface MarketRewardsInfoStructOutput {
  rewardSpeedPerSecondPerToken: BigNumber;
  rewardTokenPrice: BigNumber;
  formattedAPR: BigNumber;
  flywheel: string;
  rewardToken: string;
}

export interface LeveredBorrowable {
  cToken: string;
  underlyingToken: string;
  underlyingDecimals: number;
  underlyingPrice: BigNumber;
  symbol: string;
  rate: BigNumber;
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
  borrowable: LeveredBorrowable;
  address: string;
  isClosed: boolean;
}

export interface NewPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: LeveredBorrowable[];
}

export interface PositionInfo {
  positionSupplyAmount: BigNumber;
  positionValue: BigNumber;
  debtAmount: BigNumber;
  debtValue: BigNumber;
  equityValue: BigNumber;
  equityAmount: BigNumber;
  currentApy: BigNumber;
  debtRatio: BigNumber;
  liquidationThreshold: BigNumber;
  safetyBuffer: BigNumber;
}

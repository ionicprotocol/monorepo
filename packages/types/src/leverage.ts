import { Address } from "viem";

import { SupportedChains } from "./enums";

export interface MarketRewardsInfoStructOutput {
  rewardSpeedPerSecondPerToken: bigint;
  rewardTokenPrice: bigint;
  formattedAPR: bigint;
  flywheel: Address;
  rewardToken: Address;
}

export interface LeveredBorrowable {
  cToken: Address;
  underlyingToken: Address;
  underlyingDecimals: number;
  underlyingPrice: bigint;
  symbol: string;
  rate: bigint;
}

export interface LeveredCollateral {
  cToken: Address;
  underlyingToken: Address;
  underlyingDecimals: bigint;
  symbol: string;
  supplyRatePerBlock: bigint;
  totalSupplied: bigint;
  pool: Address;
  plugin?: Address;
  reward?: {
    underlyingPrice: bigint;
    market: Address;
    rewardsInfo: MarketRewardsInfoStructOutput[];
  };
  underlyingPrice: bigint;
}

export interface OpenPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: LeveredBorrowable;
  address: Address;
  isClosed: boolean;
}

export interface NewPosition {
  chainId: SupportedChains;
  collateral: LeveredCollateral;
  borrowable: LeveredBorrowable[];
}

export interface PositionInfo {
  positionSupplyAmount: bigint;
  positionValue: bigint;
  debtAmount: bigint;
  debtValue: bigint;
  equityValue: bigint;
  equityAmount: bigint;
  currentApy: bigint;
  debtRatio: bigint;
  liquidationThreshold: bigint;
  safetyBuffer: bigint;
  collateralAssetPrice: bigint;
  borrowedAssetPrice: bigint;
}

export type LeveragePoolConfig = { pool: Address; pairs: LeveragePair[] };

type LeveragePair = {
  borrow: Address;
  collateral: Address;
};

import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface VaultData {
  chainId: SupportedChains;
  totalSupply: BigNumber;
  totalSupplyNative: number;
  asset: string;
  symbol: string;
  supplyApy: BigNumber;
  adaptersCount: number;
  isEmergencyStopped: boolean;
  adapters: Adapter[];
  decimals: number;
  underlyingPrice: BigNumber;
  vault: string;
  extraDocs: string | undefined;
  performanceFee: BigNumber;
  depositFee: BigNumber;
  withdrawalFee: BigNumber;
  managementFee: BigNumber;
}

export interface Adapter {
  adapter: string;
  allocation: BigNumber;
  market: string;
  pool: string;
}

export interface VaultApy {
  supplyApy: string;
  totalSupply: string;
  createdAt: number;
}

export type FlywheelRewardsInfoForVault = {
  vault: string;
  chainId: number;
  rewardsInfo: RewardsInfo[];
};

export interface RewardsInfo {
  rewardToken: string;
  flywheel: string;
  rewards: BigNumber;
  rewardTokenDecimals: number;
  rewardTokenSymbol: string;
}

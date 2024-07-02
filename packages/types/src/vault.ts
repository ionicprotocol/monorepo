import { Address } from "viem";

import { SupportedChains } from "./enums";

export interface VaultData {
  chainId: SupportedChains;
  totalSupply: bigint;
  totalSupplyNative: number;
  asset: Address;
  symbol: string;
  supplyApy: bigint;
  adaptersCount: number;
  isEmergencyStopped: boolean;
  adapters: Adapter[];
  decimals: number;
  underlyingPrice: bigint;
  vault: Address;
  extraDocs: string | undefined;
  performanceFee: bigint;
  depositFee: bigint;
  withdrawalFee: bigint;
  managementFee: bigint;
}

export interface Adapter {
  adapter: Address;
  allocation: bigint;
  market: Address;
  pool: Address;
}

export interface VaultApy {
  supplyApy: string;
  totalSupply: string;
  createdAt: number;
}

export type FlywheelRewardsInfoForVault = {
  vault: Address;
  chainId: number;
  rewardsInfo: RewardsInfo[];
};

export interface RewardsInfo {
  rewardToken: Address;
  flywheel: Address;
  rewards: bigint;
  rewardTokenDecimals: number;
  rewardTokenSymbol: string;
}

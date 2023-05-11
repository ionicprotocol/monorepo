import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface LeverageData {
  chainId: SupportedChains;
  totalSupply: BigNumber;
  totalSupplyNative: number;
  asset: string;
  symbol: string;
  supplyApy: BigNumber;
  adaptersCount: number;
  isEmergencyStopped: boolean;
  decimals: number;
  underlyingPrice: BigNumber;
  vault: string;
  extraDocs: string | undefined;
  performanceFee: BigNumber;
  depositFee: BigNumber;
  withdrawalFee: BigNumber;
  managementFee: BigNumber;
}

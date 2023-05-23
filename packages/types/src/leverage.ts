import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface LeveredPositionBorrowable {
  cToken: string;
  underlyingToken: string;
  symbol: string;
  rate: BigNumber;
}

export interface LeveredPositionCollateral {
  cToken: string;
  underlyingToken: string;
  underlyingDecimals: BigNumber;
  symbol: string;
  supplyRatePerBlock: BigNumber;
  totalSupplied: BigNumber;
}

export interface LeveredPosition {
  chainId: SupportedChains;
  collateral: LeveredPositionCollateral;
  borrowable: LeveredPositionBorrowable[];
}

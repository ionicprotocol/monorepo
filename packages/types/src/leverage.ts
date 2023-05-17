import { BigNumber } from "ethers";

import { SupportedChains } from "./enums";

export interface LeveredPositionBorrowable {
  cToken: string;
  underlyingToken: string;
  symbol: string;
  rate: number;
}

export interface LeveredPosition {
  chainId: SupportedChains;
  collateral: {
    cToken: string;
    underlyingToken: string;
    symbol: string;
    supplyRatePerYear: BigNumber;
  };
  borrowable: LeveredPositionBorrowable[];
}

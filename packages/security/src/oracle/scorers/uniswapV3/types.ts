import { BigNumber } from "ethers";

export type TargetType = "price" | "sqrtPriceX96After" | "priceImpact";
export type Direction = "pump" | "dump";

export type Quote = {
  amountOut: BigNumber;
  sqrtPriceX96After: BigNumber;
  initializedTicksCrossed: BigNumber;
  gasEstimate: BigNumber;
};

export type Trade = {
  amountIn?: BigNumber;
  value: number;
  priceImpact: string;
  sqrtPriceX96After?: BigNumber;
  price: string;
  after?: BigNumber;
  amountOut?: BigNumber;
  tokenOut?: string;
  gasEstimate?: BigNumber;
};

export type ExtendedTrade = Trade & {
  index: number;
};
export type PumpAndDump = {
  pump: Trade;
  dump: Trade;
};

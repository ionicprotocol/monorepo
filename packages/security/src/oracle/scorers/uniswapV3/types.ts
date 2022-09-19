import Decimal from "decimal.js";
import { BigNumber } from "ethers";

export type TargetType = "price" | "sqrtPriceX96After" | "priceImpact";
export type Direction = "pump" | "dump";

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
};

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
  sqrtPriceX96After?: string;
  price: string;
  after?: BigNumber;
  amountOut?: BigNumber;
  tokenOut?: string;
  gasEstimate?: BigNumber;
  index?: number;
};

export type PumpAndDump = {
  pump: Trade;
  dump: Trade;
};

export type UniswapV3AssetConfig = {
  token: Token;
  targetPriceImpact: Decimal;
  fee: number;
  baseToken: string;
};

export type Slot0 = {
  sqrtPriceX96: BigNumber;
  tick: BigNumber;
  observationIndex: BigNumber;
  price?: BigNumber;
};

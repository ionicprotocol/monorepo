import Decimal from "decimal.js";
import { BigNumber } from "ethers";

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
  amountIn: BigNumber;
  value: number;
  priceImpact: string;
  sqrtPriceX96After?: string;
  price: BigNumber;
  after: BigNumber;
  amountOut: BigNumber;
  tokenOut: string;
  gasEstimate?: BigNumber;
  index: number;
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
  cardinality: number;
  attackBlocks: number;
  inverted: boolean;
};

export type Slot0 = {
  sqrtPriceX96: BigNumber;
  tick: BigNumber;
  observationIndex: BigNumber;
  price: BigNumber;
};

export type Attack = {
  type: Direction;
  price: BigNumber;
  priceImpact: string;
  after: BigNumber;
  cost: number;
  amountIn: BigNumber;
  amountOut: BigNumber;
  tokenOut: string;
};

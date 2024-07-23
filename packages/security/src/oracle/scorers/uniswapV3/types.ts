import Decimal from "decimal.js";

export type Direction = "pump" | "dump";

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
};

export type Quote = {
  amountOut: bigint;
  sqrtPriceX96After: bigint;
  initializedTicksCrossed: bigint;
  gasEstimate: bigint;
};

export type Trade = {
  amountIn: bigint;
  value: number;
  priceImpact: string;
  sqrtPriceX96After?: string;
  price: bigint;
  after: bigint;
  amountOut: bigint;
  tokenOut: string;
  gasEstimate?: bigint;
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
  sqrtPriceX96: bigint;
  tick: bigint;
  observationIndex: bigint;
  price: bigint;
};

export type Attack = {
  type: Direction;
  price: bigint;
  priceImpact: string;
  after: bigint;
  cost: number;
  amountIn: bigint;
  amountOut: bigint;
  tokenOut: string;
};

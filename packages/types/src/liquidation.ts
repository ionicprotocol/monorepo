import { Address } from "viem";

import { FundingStrategyContract, LiquidationStrategy, RedemptionStrategyContract } from "./enums";

export type LiquidationDefaults = {
  DEFAULT_ROUTER: string;
  ASSET_SPECIFIC_ROUTER: {
    [token: string]: string;
  };
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: bigint;
  LIQUIDATION_INTERVAL_SECONDS: number;
  jarvisPools: Array<JarvisLiquidityPool>;
  balancerPools: Array<BalancerSwapPool>;
};

export type RedemptionStrategy = {
  inputToken: Address;
  outputToken: Address;
  strategy: RedemptionStrategyContract;
};

export type FundingStrategy = {
  inputToken: Address;
  outputToken: Address;
  strategy: FundingStrategyContract;
};

export type JarvisLiquidityPool = {
  expirationTime: number;
  liquidityPoolAddress: Address;
  syntheticToken: Address;
  collateralToken: Address;
};

export type CurveSwapPool = {
  poolAddress: Address;
  coins: Address[];
};

export type BalancerSwapPool = {
  poolAddress: Address;
  underlyingTokens: Address[];
};

export type SaddlePool = CurveSwapPool;

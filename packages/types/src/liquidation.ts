import { BigNumber } from "ethers";

import { FundingStrategyContract, LiquidationStrategy, RedemptionStrategyContract } from "./enums";

export type LiquidationDefaults = {
  DEFAULT_ROUTER: string;
  ASSET_SPECIFIC_ROUTER: {
    [token: string]: string;
  };
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: BigNumber;
  LIQUIDATION_INTERVAL_SECONDS: number;
  jarvisPools: Array<JarvisLiquidityPool>;
  balancerPools: Array<BalancerSwapPool>;
};

export type RedemptionStrategy = {
  inputToken: string;
  outputToken: string;
  strategy: RedemptionStrategyContract;
};

export type FundingStrategy = {
  inputToken: string;
  outputToken: string;
  strategy: FundingStrategyContract;
};

export type JarvisLiquidityPool = {
  expirationTime: number;
  liquidityPoolAddress: string;
  syntheticToken: string;
  collateralToken: string;
};

export type CurveSwapPool = {
  poolAddress: string;
  coins: string[];
};

export type BalancerSwapPool = {
  poolAddress: string;
  underlyingTokens: string[];
};

export type SaddlePool = CurveSwapPool;

import { BigNumber } from "ethers";

import { FundingStrategyContract, LiquidationStrategy, RedemptionStrategyContract } from "./enums";

export type LiquidationDefaults = {
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: BigNumber;
  LIQUIDATION_INTERVAL_SECONDS: number;
  jarvisPools: Array<JarvisLiquidityPool>;
  curveSwapPools: Array<CurveSwapPool>;
};

export type RedemptionStrategy = {
  [token: string]: [RedemptionStrategyContract, string];
};

export type FundingStrategy = {
  [token: string]: [FundingStrategyContract, string];
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

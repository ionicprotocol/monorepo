import { LiquidationStrategy } from "@ionicprotocol/types";

import { IonicBase } from "../../IonicSdk";

export type ChainLiquidationConfig = {
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: bigint;
  LIQUIDATION_INTERVAL_SECONDS: number;
};

export const getChainLiquidationConfig = (sdk: IonicBase): ChainLiquidationConfig => {
  return {
    SUPPORTED_OUTPUT_CURRENCIES: process.env.SUPPORTED_OUTPUT_CURRENCIES
      ? process.env.SUPPORTED_OUTPUT_CURRENCIES.split(",")
      : sdk.liquidationConfig.SUPPORTED_OUTPUT_CURRENCIES,
    SUPPORTED_INPUT_CURRENCIES: process.env.SUPPORTED_INPUT_CURRENCIES
      ? process.env.SUPPORTED_INPUT_CURRENCIES.split(",")
      : sdk.liquidationConfig.SUPPORTED_INPUT_CURRENCIES,
    LIQUIDATION_STRATEGY: process.env.LIQUIDATION_STRATEGY
      ? (process.env.LIQUIDATION_STRATEGY as LiquidationStrategy)
      : sdk.liquidationConfig.LIQUIDATION_STRATEGY,
    MINIMUM_PROFIT_NATIVE: process.env.MINIMUM_PROFIT_NATIVE
      ? BigInt(process.env.MINIMUM_PROFIT_NATIVE)
      : sdk.liquidationConfig.MINIMUM_PROFIT_NATIVE,
    LIQUIDATION_INTERVAL_SECONDS: process.env.LIQUIDATION_INTERVAL_SECONDS
      ? parseInt(process.env.LIQUIDATION_INTERVAL_SECONDS)
      : sdk.liquidationConfig.LIQUIDATION_INTERVAL_SECONDS
  };
};

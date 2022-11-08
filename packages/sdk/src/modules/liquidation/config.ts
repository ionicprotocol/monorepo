import { LiquidationStrategy } from "@midas-capital/types";
import { BigNumber } from "ethers";

import { MidasBase } from "../../MidasSdk";

export type ChainLiquidationConfig = {
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: BigNumber;
  LIQUIDATION_INTERVAL_SECONDS: number;
};

export const getChainLiquidationConfig = (fuse: MidasBase): ChainLiquidationConfig => {
  return {
    SUPPORTED_OUTPUT_CURRENCIES: process.env.SUPPORTED_OUTPUT_CURRENCIES
      ? process.env.SUPPORTED_OUTPUT_CURRENCIES.split(",")
      : fuse.liquidationConfig.SUPPORTED_OUTPUT_CURRENCIES,
    SUPPORTED_INPUT_CURRENCIES: process.env.SUPPORTED_INPUT_CURRENCIES
      ? process.env.SUPPORTED_INPUT_CURRENCIES.split(",")
      : fuse.liquidationConfig.SUPPORTED_INPUT_CURRENCIES,
    LIQUIDATION_STRATEGY: process.env.LIQUIDATION_STRATEGY
      ? (process.env.LIQUIDATION_STRATEGY as LiquidationStrategy)
      : fuse.liquidationConfig.LIQUIDATION_STRATEGY,
    MINIMUM_PROFIT_NATIVE: process.env.MINIMUM_PROFIT_NATIVE
      ? BigNumber.from(process.env.MINIMUM_PROFIT_NATIVE)
      : fuse.liquidationConfig.MINIMUM_PROFIT_NATIVE,
    LIQUIDATION_INTERVAL_SECONDS: process.env.LIQUIDATION_INTERVAL_SECONDS
      ? parseInt(process.env.LIQUIDATION_INTERVAL_SECONDS)
      : fuse.liquidationConfig.LIQUIDATION_INTERVAL_SECONDS,
  };
};

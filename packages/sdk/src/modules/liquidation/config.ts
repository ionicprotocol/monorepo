import { BigNumber, constants } from "ethers";
import { FuseBase } from "../../Fuse";
import { LiquidationKind, LiquidationStrategy } from "../../";

export type ChainLiquidationConfig = {
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: BigNumber;
};

export const getChainLiquidationConfig = (fuse: FuseBase): ChainLiquidationConfig => {
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
  };
};

export const getLiquidationKind = (
  liquidationStrategy: LiquidationStrategy,
  underlyingToken: string
): LiquidationKind => {
  if (liquidationStrategy === LiquidationStrategy.UNISWAP) {
    if (underlyingToken == constants.AddressZero) {
      return LiquidationKind.UNISWAP_NATIVE_BORROW;
    } else {
      return LiquidationKind.UNISWAP_TOKEN_BORROW;
    }
  } else if (liquidationStrategy === LiquidationStrategy.DEFAULT) {
    if (underlyingToken == constants.AddressZero) {
      return LiquidationKind.DEFAULT_NATIVE_BORROW;
    } else {
      return LiquidationKind.DEFAULT_TOKEN_BORROW;
    }
  } else {
    throw `Invalid liquidation strategy: ${liquidationStrategy}`;
  }
};

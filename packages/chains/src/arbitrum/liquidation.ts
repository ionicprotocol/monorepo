import {
  assetSymbols,
  LiquidationDefaults,
  LiquidationStrategy,
  SupportedAsset,
  underlying,
} from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  curveSwapPools: [],
};

export default liquidationDefaults;

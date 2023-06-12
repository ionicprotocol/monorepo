import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WNEON)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WNEON)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: [],
};

export default liquidationDefaults;

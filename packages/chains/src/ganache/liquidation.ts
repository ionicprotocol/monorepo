import {
  assetSymbols,
  LiquidationDefaults,
  LiquidationStrategy,
  SupportedAsset,
  underlying
} from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 2,
  jarvisPools: [],
  balancerPools: []
};

export default liquidationDefaults;

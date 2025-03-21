import { LiquidationDefaults, LiquidationStrategy } from "@ionicprotocol/types";
import { zeroAddress } from "viem";

import chainAddresses from "./addresses";
import { WUSDX } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [zeroAddress, WUSDX],
  SUPPORTED_INPUT_CURRENCIES: [zeroAddress, WUSDX],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: 0n,
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: []
};

export default liquidationDefaults;

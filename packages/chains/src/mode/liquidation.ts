import { LiquidationDefaults, LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { WETH, USDC } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, WETH, USDC],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WETH],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: []
};

export default liquidationDefaults;

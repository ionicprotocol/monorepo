import { LiquidationDefaults, LiquidationStrategy } from "@ionicprotocol/types";
import { constants, utils } from "ethers";

import chainAddresses from "./addresses";
import { PYTH_BTC, PYTH_USDC, USDC, USDT, WBTC, WETH } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, WETH, WBTC, USDT, USDC, PYTH_BTC, PYTH_USDC],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WETH, WBTC, USDT, PYTH_BTC, PYTH_USDC],
  LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
  MINIMUM_PROFIT_NATIVE: utils.parseEther("0.001"),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: []
};

export default liquidationDefaults;

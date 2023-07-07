import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WETH)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: [
    {
      poolAddress: "0x89dc7e71e362faF88D92288fE2311D25c6a1B5E0",
      underlyingTokens: [underlying(assets, assetSymbols.WETH), underlying(assets, assetSymbols.OHM)],
    },
  ],
};

export default liquidationDefaults;

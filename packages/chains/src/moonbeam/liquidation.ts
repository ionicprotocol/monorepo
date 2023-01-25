import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WGLMR)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WGLMR)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 60,
  jarvisPools: [],
  curveSwapPools: [
    {
      poolAddress: "0x0fFc46cD9716a96d8D89E1965774A70Dcb851E50",
      coins: [underlying(assets, assetSymbols.xcDOT), underlying(assets, assetSymbols.stDOT)],
    },
  ],
  saddlePools: [
    {
      poolAddress: "0xB1BC9f56103175193519Ae1540A0A4572b1566F6",
      coins: [
        underlying(assets, assetSymbols.USDC_wh),
        underlying(assets, assetSymbols.USDT_xc),
        underlying(assets, assetSymbols.BUSD_wh),
        underlying(assets, assetSymbols.FRAX),
      ],
    },
  ],
  balancerPools: [],
};

export default liquidationDefaults;

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
      coins: [
        "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080", // xcDOT
        "0xFA36Fe1dA08C89eC72Ea1F0143a35bFd5DAea108", // stDOT
      ],
    },
  ],
};

export default liquidationDefaults;

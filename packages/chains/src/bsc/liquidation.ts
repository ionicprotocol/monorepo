import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import assets, { WBNB } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, WBNB],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WBNB],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 40,
  jarvisPools: [
    // jBRL <-> BUSD
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x0fD8170Dc284CD558325029f6AEc1538c7d99f49",
      syntheticToken: underlying(assets, assetSymbols.jBRL),
      collateralToken: underlying(assets, assetSymbols.BUSD),
    },
  ],
};

export default liquidationDefaults;

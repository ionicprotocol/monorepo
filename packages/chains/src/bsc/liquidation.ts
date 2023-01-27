import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import assets, { WBNB } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {
    [underlying(assets, assetSymbols["asBNBx-WBNB"])]: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
    [underlying(assets, assetSymbols.BNBx)]: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7", // ApeSwap router
  },
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, WBNB],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WBNB],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 60,
  jarvisPools: [
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x0fD8170Dc284CD558325029f6AEc1538c7d99f49",
      syntheticToken: underlying(assets, assetSymbols.jBRL),
      collateralToken: underlying(assets, assetSymbols.BUSD),
    },
  ],
};

export default liquidationDefaults;

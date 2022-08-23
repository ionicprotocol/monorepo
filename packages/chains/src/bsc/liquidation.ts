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
  curveSwapPools: [
    {
      poolAddress: "0x68354c6E8Bbd020F9dE81EAf57ea5424ba9ef322",
      coins: [
        "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d", // MAI
        "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5", // val3EPS
      ]
    },
  ],
};

export default liquidationDefaults;

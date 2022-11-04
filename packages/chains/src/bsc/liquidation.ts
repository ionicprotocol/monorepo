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
      coins: [underlying(assets, assetSymbols.MAI), underlying(assets, assetSymbols.val3EPS)],
    },
    {
      poolAddress: "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d", // val3EPS LP token
      coins: [
        underlying(assets, assetSymbols.BUSD),
        underlying(assets, assetSymbols.USDC),
        underlying(assets, assetSymbols.USDT),
      ],
    },
    {
      poolAddress: "0x43719DfFf12B04C71F7A589cdc7F54a01da07D7a", // 3brl pool
      coins: [
        underlying(assets, assetSymbols.jBRL),
        underlying(assets, assetSymbols.BRZ),
        underlying(assets, assetSymbols.BRZw),
      ],
    },
  ],
};

export default liquidationDefaults;

import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets, USDC, WETH, wstETH } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [
    constants.AddressZero,
    underlying(assets, assetSymbols.WETH),
    underlying(assets, assetSymbols.USDC),
    underlying(assets, assetSymbols.USDT),
    underlying(assets, assetSymbols.DAI)
  ],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, WETH],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 20,
  jarvisPools: [],
  balancerPools: [
    {
      poolAddress: underlying(assets, assetSymbols.WSTETH_WETH_STABLE_BPT),
      underlyingTokens: [underlying(assets, assetSymbols.WETH), wstETH]
    },
    {
      poolAddress: underlying(assets, assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT),
      underlyingTokens: [wstETH, underlying(assets, assetSymbols.rETH), underlying(assets, assetSymbols.frxETH)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.WSTETH_CBETH_STABLE_BPT),
      underlyingTokens: [wstETH, underlying(assets, assetSymbols.cbETH)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.WSTETH_CBETH_STABLE_BPT),
      underlyingTokens: [wstETH, underlying(assets, assetSymbols.cbETH)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.AAVE_BOOSTED_STABLE_BPT),
      underlyingTokens: [
        underlying(assets, assetSymbols.AAVE_LINEAR_DAI),
        underlying(assets, assetSymbols.AAVE_LINEAR_USDC),
        underlying(assets, assetSymbols.AAVE_LINEAR_USDT)
      ]
    },
    {
      poolAddress: underlying(assets, assetSymbols.AAVE_LINEAR_USDC),
      underlyingTokens: [USDC, underlying(assets, assetSymbols.AAVE_LINEAR_USDC)]
    }
  ]
};

export default liquidationDefaults;

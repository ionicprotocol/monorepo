import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [
    constants.AddressZero,
    underlying(assets, assetSymbols.WMATIC),
    underlying(assets, assetSymbols.USDC),
    underlying(assets, assetSymbols.USDT)
  ],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WMATIC)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 60,
  jarvisPools: [
    //  jEUR <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x65a7b4Ff684C2d08c115D55a4B089bf4E92F5003",
      syntheticToken: underlying(assets, assetSymbols.JEUR),
      collateralToken: underlying(assets, assetSymbols.USDC)
    }
  ],
  balancerPools: [
    {
      poolAddress: underlying(assets, assetSymbols.MIMO_PAR_80_20),
      underlyingTokens: [underlying(assets, assetSymbols.MIMO), underlying(assets, assetSymbols.PAR)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.BRZ_JBRL_STABLE_BLP),
      underlyingTokens: [underlying(assets, assetSymbols.jBRL), underlying(assets, assetSymbols.BRZ)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
      underlyingTokens: [underlying(assets, assetSymbols.JEUR), underlying(assets, assetSymbols.PAR)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.WMATIC_CSMATIC_STABLE_BLP),
      underlyingTokens: [underlying(assets, assetSymbols.WMATIC), underlying(assets, assetSymbols.csMATIC)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP),
      underlyingTokens: [underlying(assets, assetSymbols.WMATIC), underlying(assets, assetSymbols.MATICx)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.TETU_BOOSTED_STABLE_BLP),
      underlyingTokens: [
        underlying(assets, assetSymbols.TETU_LINEAR_DAI),
        underlying(assets, assetSymbols.TETU_LINEAR_USDC),
        underlying(assets, assetSymbols.TETU_LINEAR_USDT)
      ]
    },
    {
      poolAddress: underlying(assets, assetSymbols.TETU_LINEAR_USDC),
      underlyingTokens: [underlying(assets, assetSymbols.USDC)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
      underlyingTokens: [underlying(assets, assetSymbols.MATICx), underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.StMatic_bbaWMATIC),
      underlyingTokens: [underlying(assets, assetSymbols.stMATIC), underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.StMatic_bbaWMATIC),
      underlyingTokens: [underlying(assets, assetSymbols.stMATIC), underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)]
    },
    {
      poolAddress: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
      underlyingTokens: [underlying(assets, assetSymbols.WMATIC), underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)]
    }
  ]
};

export default liquidationDefaults;

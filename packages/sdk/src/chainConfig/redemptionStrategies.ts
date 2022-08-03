import { RedemptionStrategyContract, SupportedChains } from "../enums";
import { ChainRedemptionStrategy } from "../types";

import { assetSymbols, bscAssets, moonbeamAssets } from "./assets";
import { underlying } from "./supportedAssets";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    [underlying(bscAssets, assetSymbols["3EPS"])]: [
      RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
      "ignored",
    ],
    [underlying(bscAssets, assetSymbols["2brl"])]: [
      RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
      "ignored",
    ],
    [underlying(bscAssets, assetSymbols.val3EPS)]: [
      RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
      "ignored",
    ],
    [underlying(bscAssets, assetSymbols.valdai3EPS)]: [
      RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
      "ignored",
    ],
    [underlying(bscAssets, assetSymbols.BOMB)]: [
      RedemptionStrategyContract.XBombLiquidator,
      underlying(bscAssets, assetSymbols.xBOMB),
    ],
    [underlying(bscAssets, assetSymbols.xBOMB)]: [
      RedemptionStrategyContract.XBombLiquidator,
      underlying(bscAssets, assetSymbols.BOMB),
    ],
    [underlying(bscAssets, assetSymbols.jBRL)]: [
      RedemptionStrategyContract.JarvisSynthereumLiquidator,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
    [underlying(bscAssets, assetSymbols["WBNB-BUSD"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
    [underlying(bscAssets, assetSymbols["WBNB-DAI"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
    [underlying(bscAssets, assetSymbols["WBNB-USDC"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
    [underlying(bscAssets, assetSymbols["WBNB-USDT"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
    [underlying(bscAssets, assetSymbols["WBNB-ETH"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
    [underlying(bscAssets, assetSymbols["BUSD-USDT"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
    [underlying(bscAssets, assetSymbols["BUSD-BTCB"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
    [underlying(bscAssets, assetSymbols["USDC-BUSD"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
    [underlying(bscAssets, assetSymbols["USDC-ETH"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.USDC),
    ],
    [underlying(bscAssets, assetSymbols["BTCB-BOMB"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.BTCB),
    ],
    [underlying(bscAssets, assetSymbols["BTCB-ETH"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.BTCB),
    ],
    [underlying(bscAssets, assetSymbols["CAKE-WBNB"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {
    [underlying(bscAssets, assetSymbols["WBNB-BUSD"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
  },
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {
    [underlying(moonbeamAssets, assetSymbols["GLMR-USDC"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(moonbeamAssets, assetSymbols.WGLMR),
    ],
    [underlying(moonbeamAssets, assetSymbols["GLMR-GLINT"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(moonbeamAssets, assetSymbols.WGLMR),
    ],
  },
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  },
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
};

export default chainRedemptionStrategies;

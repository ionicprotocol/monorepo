import {
  assetSymbols,
  ChainRedemptionStrategy,
  RedemptionStrategyContract,
  SupportedChains,
  underlying,
} from "@midas-capital/types";

import { bscAssets, moonbeamAssets, polygonAssets } from "./assets";

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
      RedemptionStrategyContract.JarvisLiquidatorFunder,
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
  [SupportedChains.chapel]: {
    [underlying(bscAssets, assetSymbols["WBNB-BUSD"])]: [
      RedemptionStrategyContract.UniswapLpTokenLiquidator,
      underlying(bscAssets, assetSymbols.WBNB),
    ],
  },
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
  [SupportedChains.evmos]: {
    "0x -- Kinesis": [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  },
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {
    [underlying(polygonAssets, assetSymbols.JAUD)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JCAD)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JCHF)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JCNY)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JEUR)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JCAD)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JGBP)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JJPY)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JKRW)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JSGD)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JMXN)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JNZD)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JPLN)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JSEK)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.JPHP)]: [
      RedemptionStrategyContract.JarvisLiquidatorFunder,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_WETH_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_DAI_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_MAI_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_PAR_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_USDT_001)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_USDT_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_WETH_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_USDC_agEUR_001)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.USDC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_WBTC_WETH_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.WBTC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_WETH_DAI_03)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.WETH),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_WMATIC_AAVE_03)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.WMATIC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_WMATIC_USDC_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.WMATIC),
    ],
    [underlying(polygonAssets, assetSymbols.arrarkis_WMATIC_WETH_005)]: [
      RedemptionStrategyContract.GelatoGUniLiquidator,
      underlying(polygonAssets, assetSymbols.WMATIC),
    ],
  },
};

export default chainRedemptionStrategies;

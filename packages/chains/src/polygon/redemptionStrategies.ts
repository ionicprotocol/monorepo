import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.JAUD)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCAD)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCHF)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCNY)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JEUR)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCAD)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JGBP)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JJPY)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JKRW)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSGD)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JMXN)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JNZD)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPLN)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSEK)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPHP)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_DAI_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_MAI_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_PAR_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_USDT_001)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_USDT_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_USDC_agEUR_001)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrakis_WBTC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WBTC),
  ],
  [underlying(assets, assetSymbols.arrakis_WETH_DAI_03)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WETH),
  ],
  [underlying(assets, assetSymbols.arrakis_WMATIC_AAVE_03)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.arrakis_WMATIC_USDC_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.arrakis_WMATIC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
};

export default redemptionStrategies;

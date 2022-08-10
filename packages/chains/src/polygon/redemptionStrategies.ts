import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.JAUD)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCAD)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCHF)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCNY)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JEUR)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCAD)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JGBP)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JJPY)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JKRW)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSGD)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JMXN)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JNZD)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPLN)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSEK)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPHP)]: [
    RedemptionStrategyContract.JarvisSynthereumLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_DAI_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_MAI_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_PAR_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_USDT_001)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_USDT_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_USDC_agEUR_001)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.arrarkis_WBTC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WBTC),
  ],
  [underlying(assets, assetSymbols.arrarkis_WETH_DAI_03)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WETH),
  ],
  [underlying(assets, assetSymbols.arrarkis_WMATIC_AAVE_03)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.arrarkis_WMATIC_USDC_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.arrarkis_WMATIC_WETH_005)]: [
    RedemptionStrategyContract.GelatoGUniLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
};

export default redemptionStrategies;

import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC, WMATIC } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.jBRL)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
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
  [underlying(assets, assetSymbols["AGEUR-JEUR"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols["JEUR-PAR"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols["JJPY-JPYC"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JJPY),
  ],
  [underlying(assets, assetSymbols["JCAD-CADC"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JCAD),
  ],
  [underlying(assets, assetSymbols["JSGD-XSGD"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JSGD),
  ],
  [underlying(assets, assetSymbols["JNZD-NZDS"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JNZD),
  ],
  [underlying(assets, assetSymbols["JEUR-EURT"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols["EURE-JEUR"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols.am3CRV)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.USDR3CRV)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols["MAI-USDC"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, USDC],
  [underlying(assets, assetSymbols["WMATIC-MATICx"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WMATIC],
  [underlying(assets, assetSymbols.MIMO_PAR_80_20)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.PAR),
  ],
  [underlying(assets, assetSymbols.PAR)]: [
    RedemptionStrategyContract.CurveSwapLiquidator,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols.MAI)]: [
    RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.JEUR),
  ],
  [underlying(assets, assetSymbols.BRZ_JBRL_STABLE_BLP)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.jBRL),
  ],
  [underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.WMATIC_CSMATIC_STABLE_BLP)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.TETU_BOOSTED_STABLE_BLP)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    underlying(assets, assetSymbols.TETU_LINEAR_USDC),
  ],
  [underlying(assets, assetSymbols.TETU_LINEAR_USDC)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.MaticX_bbaWMATIC)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.StMatic_bbaWMATIC)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
  [underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.WMATIC),
  ],
};

export default redemptionStrategies;

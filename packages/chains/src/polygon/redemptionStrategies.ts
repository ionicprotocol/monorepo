import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets, USDC, WMATIC } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.jBRL),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JAUD),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCAD),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCHF),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCNY),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCAD),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JGBP),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JJPY),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JKRW),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JSGD),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JMXN),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JNZD),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JPLN),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JSEK),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JPHP),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_DAI_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_MAI_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_PAR_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_USDT_001),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_USDT_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_agEUR_001),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WBTC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WBTC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WETH_DAI_03),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_AAVE_03),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_USDC_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols["AGEUR-JEUR"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols["JEUR-PAR"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols["JJPY-JPYC"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JJPY),
  },
  {
    inputToken: underlying(assets, assetSymbols["JCAD-CADC"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JCAD),
  },
  {
    inputToken: underlying(assets, assetSymbols["JSGD-XSGD"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JSGD),
  },
  {
    inputToken: underlying(assets, assetSymbols["JNZD-NZDS"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JNZD),
  },
  {
    inputToken: underlying(assets, assetSymbols["JEUR-EURT"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols["EURE-JEUR"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols.am3CRV),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.amUSDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.amUSDC),
    strategy: RedemptionStrategyContract.AaveTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR3CRV),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.USDR),
  },
  {
    inputToken: underlying(assets, assetSymbols["MAI-USDC"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: USDC,
  },
  {
    inputToken: underlying(assets, assetSymbols["WMATIC-MATICx"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WMATIC,
  },
  {
    inputToken: underlying(assets, assetSymbols.MIMO_PAR_80_20),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.PAR),
  },
  {
    inputToken: underlying(assets, assetSymbols.PAR),
    strategy: RedemptionStrategyContract.CurveSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols.MAI),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
  {
    inputToken: underlying(assets, assetSymbols.BRZ_JBRL_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.jBRL),
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC_CSMATIC_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.TETU_BOOSTED_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.TETU_LINEAR_USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.TETU_LINEAR_USDC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.StMatic_bbaWMATIC),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WMATIC),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-wUSDR/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR),
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-stMATIC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.CurveLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.USDR3CRV),
  },
  {
    inputToken: underlying(assets, assetSymbols.am3CRV),
    strategy: RedemptionStrategyContract.CurveLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.USDR3CRV),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-stMATIC/USDR"]),
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-stMATIC/USDR"]),
  },
  {
    inputToken: underlying(assets, assetSymbols.stMATIC),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-stMATIC/USDR"]),
  },
];
export default redemptionStrategies;

import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets, USDC, WMATIC } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.jBRL),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_DAI_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_MAI_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_PAR_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_USDT_001),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_USDT_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_USDC_agEUR_001),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WBTC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WETH_DAI_03),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_AAVE_03),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_USDC_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.arrakis_WMATIC_WETH_005),
    strategy: RedemptionStrategyContract.GelatoGUniLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols["JEUR-PAR"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.JEUR)
  },
  {
    inputToken: underlying(assets, assetSymbols.am3CRV),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.amUSDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.amUSDC),
    strategy: RedemptionStrategyContract.AaveTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols["MAI-USDC"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols["WMATIC-MATICx"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.MIMO_PAR_80_20),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.PAR)
  },
  {
    inputToken: underlying(assets, assetSymbols.PAR),
    strategy: RedemptionStrategyContract.CurveSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.JEUR)
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.PAR)
  },
  {
    inputToken: underlying(assets, assetSymbols.PAR),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.MATICx),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: WMATIC,
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.MATICx)
  },
  {
    inputToken: underlying(assets, assetSymbols.stMATIC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: WMATIC,
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.stMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.MAI),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.JEUR)
  },
  {
    inputToken: underlying(assets, assetSymbols.BRZ_JBRL_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.jBRL)
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC_CSMATIC_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.TETU_BOOSTED_STABLE_BLP),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.TETU_LINEAR_USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.TETU_LINEAR_USDC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.StMatic_bbaWMATIC),
    strategy: RedemptionStrategyContract.BalancerLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WMATIC
  },
  // USDR -> USDC, WUSDR, LPs
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: USDC
  },
  {
    inputToken: USDC,
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WUSDR)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WUSDR)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-MATIC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-MATIC/USDR"])
  },
  // LPs -> USDR || USDC || WETH || CASH
  {
    inputToken: underlying(assets, assetSymbols.aUSDC_CASH_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols.aUSDC_WETH_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols.aWMATIC_MATICX_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: WMATIC
  },
  {
    inputToken: underlying(assets, assetSymbols.aWBTC_WETH_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-wUSDR/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-MATIC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-TNGBL/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-DAI/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-WBTC/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-WETH/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-WETH/USDR"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  // Reverse: USDC / USDR / WUSDR / CASH -> LPs
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aUSDC_CASH_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aUSDC_WETH_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.CASH),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aUSDC_CASH_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.WBTC),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aWBTC_WETH_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.MATICx),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aWMATIC_MATICX_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC),
    strategy: RedemptionStrategyContract.GammaLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols.aWMATIC_MATICX_N)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-USDC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.WUSDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-wUSDR/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-wUSDR/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-MATIC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-WBTC/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-WETH/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["vAMM-TNGBL/USDR"])
  },
  {
    inputToken: underlying(assets, assetSymbols.USDR),
    strategy: RedemptionStrategyContract.SolidlyLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["sAMM-DAI/USDR"])
  },
  // WUSDR -> USDR
  {
    inputToken: underlying(assets, assetSymbols.WUSDR),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDR)
  },
  // Davos
  {
    inputToken: underlying(assets, assetSymbols.DUSD),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: USDC
  },
  {
    inputToken: USDC,
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.DUSD)
  }
];

export default redemptionStrategies;

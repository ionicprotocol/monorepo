import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols["GLMR-USDC"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols["GLMR-GLINT"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols.xcDOT)]: [
    RedemptionStrategyContract.CurveSwapLiquidator,
    underlying(assets, assetSymbols.stDOT),
  ],
  [underlying(assets, assetSymbols["xcDOT-stDOT"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.stDOT),
  ],
  [underlying(assets, assetSymbols["USDC.wh-GLMR"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols["WBTC.wh-GLMR"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols["WETH.wh-GLMR"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols["DOT.xc-GLMR"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WGLMR),
  ],
  [underlying(assets, assetSymbols["wstDOT-DOT.xc"])]: [
    RedemptionStrategyContract.SaddleLpTokenLiquidator,
    underlying(assets, assetSymbols.wstDOT),
  ],
  [underlying(assets, assetSymbols.base4pool)]: [
    RedemptionStrategyContract.SaddleLpTokenLiquidator,
    underlying(assets, assetSymbols.USDC_wh),
  ],
};

export default redemptionStrategies;

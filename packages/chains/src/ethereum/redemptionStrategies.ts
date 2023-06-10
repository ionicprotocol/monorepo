import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC, WETH } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.realYieldUSD)]: [RedemptionStrategyContract.ERC4626Liquidator, USDC],
  [underlying(assets, assetSymbols.realYieldETH)]: [RedemptionStrategyContract.ERC4626Liquidator, WETH],
  [underlying(assets, assetSymbols.ethBtcTrend)]: [RedemptionStrategyContract.ERC4626Liquidator, WETH],
  [underlying(assets, assetSymbols.eUSD)]: [RedemptionStrategyContract.CurveSwapLiquidator, USDC],
  [underlying(assets, assetSymbols.wstETH)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
  [underlying(assets, assetSymbols.rETH)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
};

export default redemptionStrategies;

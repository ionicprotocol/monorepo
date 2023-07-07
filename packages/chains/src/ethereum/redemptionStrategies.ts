import { assetSymbols, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets, DAI, USDC, WETH, wstETH } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  // SOMM
  [underlying(assets, assetSymbols.realYieldUSD)]: [RedemptionStrategyContract.ERC4626Liquidator, USDC],
  [underlying(assets, assetSymbols.realYieldETH)]: [RedemptionStrategyContract.ERC4626Liquidator, WETH],
  [underlying(assets, assetSymbols.ethBtcTrend)]: [RedemptionStrategyContract.ERC4626Liquidator, WETH],
  // BLPs
  [underlying(assets, assetSymbols.OHM50_DAI50_BPT)]: [RedemptionStrategyContract.BalancerSwapLiquidator, DAI],
  [underlying(assets, assetSymbols.OHM50_WETH50_BPT)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
  [underlying(assets, assetSymbols.SWETH_BBA_WETH_BPT)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
  [underlying(assets, assetSymbols.WSTETH_WETH_STABLE_BPT)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
  [underlying(assets, assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    wstETH,
  ],
  [underlying(assets, assetSymbols.WBETH_WSTETH_STABLE_BPT)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    wstETH,
  ],
  [underlying(assets, assetSymbols.WSTETH_CBETH_STABLE_BPT)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    wstETH,
  ],
  [underlying(assets, assetSymbols.AAVE_BOOSTED_STABLE_BPT)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    underlying(assets, assetSymbols.AAVE_LINEAR_USDC),
  ],
  [underlying(assets, assetSymbols.AAVE_LINEAR_USDC)]: [
    RedemptionStrategyContract.BalancerSwapLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],

  // Balancer and Curve Swaps
  [underlying(assets, assetSymbols.eUSD)]: [RedemptionStrategyContract.CurveSwapLiquidatorFunder, USDC],
  [underlying(assets, assetSymbols.wstETH)]: [RedemptionStrategyContract.BalancerSwapLiquidator, WETH],
  [underlying(assets, assetSymbols.rETH)]: [RedemptionStrategyContract.BalancerSwapLiquidator, wstETH],
  [underlying(assets, assetSymbols.cbETH)]: [RedemptionStrategyContract.BalancerSwapLiquidator, wstETH],
};

export default redemptionStrategies;

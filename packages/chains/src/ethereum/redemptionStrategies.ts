import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets, DAI, USDC, WETH, wstETH } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  // SOMM
  {
    inputToken: underlying(assets, assetSymbols.realYieldUSD),
    strategy: RedemptionStrategyContract.ERC4626Liquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols.realYieldETH),
    strategy: RedemptionStrategyContract.ERC4626Liquidator,
    outputToken: WETH
  },
  {
    inputToken: underlying(assets, assetSymbols.ethBtcTrend),
    strategy: RedemptionStrategyContract.ERC4626Liquidator,
    outputToken: WETH
  },
  // BLPs
  {
    inputToken: underlying(assets, assetSymbols.OHM50_DAI50_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: DAI
  },
  {
    inputToken: underlying(assets, assetSymbols.OHM50_WETH50_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WETH
  },
  {
    inputToken: underlying(assets, assetSymbols.SWETH_BBA_WETH_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WETH
  },
  {
    inputToken: underlying(assets, assetSymbols.WSTETH_WETH_STABLE_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WETH
  },
  {
    inputToken: underlying(assets, assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: wstETH
  },
  {
    inputToken: underlying(assets, assetSymbols.WBETH_WSTETH_STABLE_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: wstETH
  },
  {
    inputToken: underlying(assets, assetSymbols.WSTETH_CBETH_STABLE_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: wstETH
  },
  {
    inputToken: underlying(assets, assetSymbols.AAVE_BOOSTED_STABLE_BPT),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.AAVE_LINEAR_USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.AAVE_LINEAR_USDC),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  // Balancer and Curve Swaps
  {
    inputToken: underlying(assets, assetSymbols.eUSD),
    strategy: RedemptionStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols.wstETH),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: WETH
  },
  {
    inputToken: underlying(assets, assetSymbols.rETH),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: wstETH
  },
  {
    inputToken: underlying(assets, assetSymbols.cbETH),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: wstETH
  }
];

export default redemptionStrategies;

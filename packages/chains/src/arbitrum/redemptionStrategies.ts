import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.OHM),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.wstETH),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.rETH),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  }
];

export default redemptionStrategies;

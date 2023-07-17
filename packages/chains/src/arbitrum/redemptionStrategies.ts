import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets, USDC } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.saddleFraxBP),
    strategy: RedemptionStrategyContract.SaddleLpTokenLiquidator,
    outputToken: USDC
  },
  {
    inputToken: underlying(assets, assetSymbols.saddleFraxUsdsBP),
    strategy: RedemptionStrategyContract.SaddleLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.saddleFraxBP)
  },
  {
    inputToken: underlying(assets, assetSymbols.saddleFraxUsdtBP),
    strategy: RedemptionStrategyContract.SaddleLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.saddleFraxBP)
  },
  {
    inputToken: underlying(assets, assetSymbols.OHM),
    strategy: RedemptionStrategyContract.BalancerSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  }
];

export default redemptionStrategies;

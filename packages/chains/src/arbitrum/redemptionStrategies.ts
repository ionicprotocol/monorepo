import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.saddleFraxBP)]: [RedemptionStrategyContract.SaddleLpTokenLiquidator, USDC],
  [underlying(assets, assetSymbols.saddleFraxUsdsBP)]: [
    RedemptionStrategyContract.SaddleLpTokenLiquidator,
    underlying(assets, assetSymbols.saddleFraxBP),
  ],
  [underlying(assets, assetSymbols.saddleFraxUsdtBP)]: [
    RedemptionStrategyContract.SaddleLpTokenLiquidator,
    underlying(assets, assetSymbols.saddleFraxBP),
  ],
};

export default redemptionStrategies;

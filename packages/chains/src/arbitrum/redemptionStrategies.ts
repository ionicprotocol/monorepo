import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.saddleFraxBP)]: [RedemptionStrategyContract.SaddleLpTokenLiquidator, USDC],
  [underlying(assets, assetSymbols.saddleFraxUsdsBP)]: [RedemptionStrategyContract.SaddleLpTokenLiquidator, USDC],
  [underlying(assets, assetSymbols.saddleFraxUsdtBP)]: [RedemptionStrategyContract.SaddleLpTokenLiquidator, USDC],
};

export default redemptionStrategies;

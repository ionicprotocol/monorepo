import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.MIMO_PAR_75_25)]: [
    RedemptionStrategyContract.BalancerLpTokenLiquidator,
    underlying(assets, assetSymbols.PAR),
  ],
  [underlying(assets, assetSymbols.PAR)]: [RedemptionStrategyContract.CurveSwapLiquidator, USDC],
  [underlying(assets, assetSymbols["PAR_USDC_CURVE"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    USDC,
  ],
};

export default redemptionStrategies;

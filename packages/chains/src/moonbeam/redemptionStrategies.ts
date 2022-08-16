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
};

export default redemptionStrategies;

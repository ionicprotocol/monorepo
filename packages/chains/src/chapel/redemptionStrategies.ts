import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols["WBNB-BUSD"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
};

export default redemptionStrategies;

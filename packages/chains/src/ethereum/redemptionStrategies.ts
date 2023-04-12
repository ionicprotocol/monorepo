import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets, USDC, WETH } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols.realYieldUSD)]: [RedemptionStrategyContract.ERC4626Liquidator, USDC],
  [underlying(assets, assetSymbols.ethBtcTrend)]: [RedemptionStrategyContract.ERC4626Liquidator, WETH],
};

export default redemptionStrategies;

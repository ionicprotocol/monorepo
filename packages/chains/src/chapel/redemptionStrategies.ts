import { assetSymbols, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols["WBNB-BUSD"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols.BOMB)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.TUSD),
  ],
  [underlying(assets, assetSymbols.BOMB)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.TDAI),
  ],
  [underlying(assets, assetSymbols.TUSD)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.BOMB),
  ],
  [underlying(assets, assetSymbols.TDAI)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.BOMB),
  ],
};

export default redemptionStrategies;

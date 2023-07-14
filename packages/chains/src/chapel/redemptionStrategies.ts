import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols["WBNB-BUSD"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WBNB),
  },
  {
    inputToken: underlying(assets, assetSymbols.BOMB),
    strategy: RedemptionStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.TUSD),
  },
  {
    inputToken: underlying(assets, assetSymbols.BOMB),
    strategy: RedemptionStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.TDAI),
  },
  {
    inputToken: underlying(assets, assetSymbols.TUSD),
    strategy: RedemptionStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BOMB),
  },
  {
    inputToken: underlying(assets, assetSymbols.TDAI),
    strategy: RedemptionStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BOMB),
  },
];

export default redemptionStrategies;

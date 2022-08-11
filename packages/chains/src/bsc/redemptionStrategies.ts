import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols["3EPS"])]: [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  [underlying(assets, assetSymbols["2brl"])]: [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  [underlying(assets, assetSymbols.val3EPS)]: [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  [underlying(assets, assetSymbols.valdai3EPS)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    "ignored",
  ],
  [underlying(assets, assetSymbols.BOMB)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.xBOMB),
  ],
  [underlying(assets, assetSymbols.xBOMB)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.BOMB),
  ],
  [underlying(assets, assetSymbols.jBRL)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["WBNB-BUSD"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols["WBNB-DAI"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols["WBNB-USDC"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols["WBNB-USDT"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols["WBNB-ETH"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols["BUSD-USDT"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["BUSD-BTCB"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["USDC-BUSD"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["USDC-ETH"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols["BTCB-BOMB"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.BTCB),
  ],
  [underlying(assets, assetSymbols["BTCB-ETH"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.BTCB),
  ],
  [underlying(assets, assetSymbols["CAKE-WBNB"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.WBNB),
  ],
};

export default redemptionStrategies;

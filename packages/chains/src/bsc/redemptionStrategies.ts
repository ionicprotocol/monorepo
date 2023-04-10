import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";

import assets, { WBNB } from "./assets";

// [input token address]: [conversion strategy, output token address]
const redemptionStrategies: { [token: string]: [RedemptionStrategyContract, string] } = {
  [underlying(assets, assetSymbols["3EPS"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols.mai3EPS)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["2brl"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.jBRL),
  ],
  [underlying(assets, assetSymbols["3brl"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.jBRL),
  ],
  [underlying(assets, assetSymbols.val3EPS)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols.valdai3EPS)]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.val3EPS),
  ],
  [underlying(assets, assetSymbols["JCHF-BUSD"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["epsBNBx-BNB"])]: [
    RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    underlying(assets, assetSymbols.WBNB),
  ],
  [underlying(assets, assetSymbols.MAI)]: [
    RedemptionStrategyContract.CurveSwapLiquidator,
    underlying(assets, assetSymbols.val3EPS),
  ],
  [underlying(assets, assetSymbols.JCHF)]: [
    RedemptionStrategyContract.CurveSwapLiquidator,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols.BOMB)]: [
    RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    underlying(assets, assetSymbols.BTCB),
  ],
  [underlying(assets, assetSymbols.xBOMB)]: [
    RedemptionStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.BOMB),
  ],
  [underlying(assets, assetSymbols.jBRL)]: [
    RedemptionStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols["WBNB-BUSD"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["WBNB-DAI"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["WBNB-USDC"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["WBNB-USDT"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["WBNB-ETH"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
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
  [underlying(assets, assetSymbols["CAKE-WBNB"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["stkBNB-WBNB"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["asBNBx-WBNB"])]: [RedemptionStrategyContract.UniswapLpTokenLiquidator, WBNB],
  [underlying(assets, assetSymbols["sAMM-jBRL/BRZ"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.jBRL),
  ],
  [underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.ankrBNB),
  ],
  [underlying(assets, assetSymbols["vAMM-ANKR/HAY"])]: [
    RedemptionStrategyContract.UniswapLpTokenLiquidator,
    underlying(assets, assetSymbols.HAY),
  ],
  [underlying(assets, assetSymbols.BNBx)]: [RedemptionStrategyContract.UniswapV2LiquidatorFunder, WBNB],
};

export default redemptionStrategies;

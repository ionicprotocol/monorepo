import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import assets, { ankrBNB, BUSD, WBNB } from "./assets";

// [input token address]: [conversion strategy, output token address]
const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols["3EPS"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols.mai3EPS),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["2brl"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.jBRL)
  },
  {
    inputToken: underlying(assets, assetSymbols.jBRL),
    strategy: RedemptionStrategyContract.CurveLpTokenWrapper,
    outputToken: underlying(assets, assetSymbols["2brl"])
  },
  {
    inputToken: underlying(assets, assetSymbols["3brl"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.jBRL)
  },
  {
    inputToken: underlying(assets, assetSymbols.val3EPS),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols.valdai3EPS),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.val3EPS)
  },
  {
    inputToken: underlying(assets, assetSymbols["JCHF-BUSD"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["epsBNBx-BNB"]),
    strategy: RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry,
    outputToken: underlying(assets, assetSymbols.WBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.MAI),
    strategy: RedemptionStrategyContract.CurveSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.val3EPS)
  },
  {
    inputToken: underlying(assets, assetSymbols.JCHF),
    strategy: RedemptionStrategyContract.CurveSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols.BOMB),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BTCB)
  },
  {
    inputToken: underlying(assets, assetSymbols.xBOMB),
    strategy: RedemptionStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BOMB)
  },
  {
    inputToken: underlying(assets, assetSymbols.jBRL),
    strategy: RedemptionStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["WBNB-BUSD"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["WBNB-DAI"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["WBNB-USDC"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["WBNB-USDT"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["WBNB-ETH"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["CAKE-WBNB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["ANKR-ankrBNB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: ankrBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["stkBNB-WBNB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols["asBNBx-WBNB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols.BNBx),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols.ankrBNB),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: WBNB
  },
  {
    inputToken: underlying(assets, assetSymbols.HAY),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: BUSD
  },
  {
    inputToken: underlying(assets, assetSymbols["BUSD-USDT"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["BUSD-BTCB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["USDC-BUSD"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["USDC-ETH"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols["BTCB-BOMB"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BTCB)
  },
  {
    inputToken: underlying(assets, assetSymbols["BTCB-ETH"]),
    strategy: RedemptionStrategyContract.UniswapLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BTCB)
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-jBRL/BRZ"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.jBRL)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-ANKR/HAY"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.HAY)
  },
  {
    inputToken: underlying(assets, assetSymbols["sAMM-HAY/BUSD"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    inputToken: underlying(assets, assetSymbols["vAMM-HAY/ankrBNB"]),
    strategy: RedemptionStrategyContract.SolidlyLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },

  {
    inputToken: underlying(assets, assetSymbols.aWBNB_STKBNB),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.WBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_ANKR_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_ANKR_W),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_RDNT_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_RDNT_W),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_THE_N),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.aANKRBNB_THE_W),
    strategy: RedemptionStrategyContract.GammaLpTokenLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    inputToken: underlying(assets, assetSymbols.RDNT),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.ankrBNB)
  }
];

export default redemptionStrategies;

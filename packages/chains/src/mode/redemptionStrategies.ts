import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDT),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDT)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.USDT)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDT),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols.WBTC),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.ezETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.ezETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.weETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.weETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.wrsETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.wrsETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.mBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols.mBTC),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.MODE)
  },
  {
    inputToken: underlying(assets, assetSymbols.MODE),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.ION)
  },
  {
    inputToken: underlying(assets, assetSymbols.ION),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.mBTC),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, assetSymbols.mBTC)
  }
  // ,{
  //   inputToken: underlying(assets, assetSymbols.WETH),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, assetSymbols.KIM)
  // },
  // {
  //   inputToken: underlying(assets, assetSymbols.KIM),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, assetSymbols.WETH)
  // }
];

export default redemptionStrategies;

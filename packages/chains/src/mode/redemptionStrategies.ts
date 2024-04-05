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
  }
];

export default redemptionStrategies;

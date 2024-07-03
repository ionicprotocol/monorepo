import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDT),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDT)
  },
  {
    inputToken: underlying(assets, assetSymbols.OP),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.OP)
  },
  {
    inputToken: underlying(assets, assetSymbols.wstETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.wstETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.SNX),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.SNX)
  },
  {
    inputToken: underlying(assets, assetSymbols.WBTC),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols.LUSD),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.LUSD)
  }
];

export default redemptionStrategies;

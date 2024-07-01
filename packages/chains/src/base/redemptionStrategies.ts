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
    inputToken: underlying(assets, assetSymbols.ezETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.ezETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.ezETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
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
    inputToken: underlying(assets, assetSymbols.cbETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.cbETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.AERO),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.AERO)
  },
  {
    inputToken: underlying(assets, assetSymbols.SNX),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
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
    inputToken: underlying(assets, assetSymbols.weETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV3LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.weETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.eUSD),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.SolidlySwapLiquidator,
    outputToken: underlying(assets, assetSymbols.eUSD)
  }
];

export default redemptionStrategies;

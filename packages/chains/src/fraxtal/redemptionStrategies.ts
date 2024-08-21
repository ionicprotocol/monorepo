import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.wFRXETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.wFRXETH),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.FRAX),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.wFRXETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.FXS),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.wFRXETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.wFRXETH),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.FXS)
  },
  {
    inputToken: underlying(assets, assetSymbols.frxBTC),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.wFRXETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.wFRXETH),
    strategy: RedemptionStrategyContract.UniswapV2LiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.frxBTC)
  }
];

export default redemptionStrategies;

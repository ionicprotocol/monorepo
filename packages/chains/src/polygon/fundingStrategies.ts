import { assetSymbols, FundingStrategy, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const fundingStrategies: FundingStrategy[] = [
  // TODO: group by input token or configure as predefined paths
  {
    inputToken: underlying(assets, assetSymbols.JAUD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JGBP),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCAD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCHF),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCNY),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JJPY),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JKRW),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JMXN),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JNZD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JPHP),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JPLN),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JSEK),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.JSGD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols.PAR),
    strategy: FundingStrategyContract.UniswapV3LiquidatorFunder, // or CurveSwapLiquidatorFunder
    outputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    inputToken: underlying(assets, assetSymbols["JEUR-EURT"]),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.JEUR),
  },
];

export default fundingStrategies;

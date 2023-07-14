import { assetSymbols, FundingStrategy, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const fundingStrategies: FundingStrategy[] = [
  // TODO: group by input token or configure as predefined paths
  {
    outputToken: underlying(assets, assetSymbols.JAUD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JGBP),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JCAD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JCHF),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JCNY),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JEUR),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JJPY),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JKRW),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JMXN),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JNZD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JPHP),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JPLN),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JSEK),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.JSGD),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols.PAR),
    strategy: FundingStrategyContract.UniswapV3LiquidatorFunder, // or CurveSwapLiquidatorFunder
    inputToken: underlying(assets, assetSymbols.USDC),
  },
  {
    outputToken: underlying(assets, assetSymbols["JEUR-EURT"]),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.JEUR),
  },
];

export default fundingStrategies;

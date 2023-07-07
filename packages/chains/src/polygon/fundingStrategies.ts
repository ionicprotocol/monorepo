import { assetSymbols, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: group by input token or configure as predefined paths
  [underlying(assets, assetSymbols.JAUD)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JGBP)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCAD)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCHF)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JCNY)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JEUR)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JJPY)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JKRW)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JMXN)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JNZD)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPHP)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JPLN)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSEK)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.JSGD)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols.PAR)]: [
    FundingStrategyContract.UniswapV3LiquidatorFunder, // or CurveSwapLiquidatorFunder
    underlying(assets, assetSymbols.USDC),
  ],
  [underlying(assets, assetSymbols["JEUR-EURT"])]: [
    FundingStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.JEUR),
  ],
};

export default fundingStrategies;

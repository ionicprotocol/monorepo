import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: group by input token or configure as predefined paths
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JAUD)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JGBP)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JCAD)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JCHF)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JCNY)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JCOP)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JEUR)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JJPY)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JKRW)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JMXN)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JNGN)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JNZD)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JPHP)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JPLN)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JSEK)
  ],
  [underlying(assets, assetSymbols.USDC)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.JSGD)
  ],
};

export default fundingStrategies;

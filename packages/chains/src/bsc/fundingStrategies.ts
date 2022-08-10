import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: don't add hard assets as the output from a funding strategy?
  // [underlying(assets, assetSymbols.jBRL)]: [
  //   FundingStrategyContract.JarvisLiquidatorFunder,
  //   underlying(assets, assetSymbols.BUSD)
  // ],
  [underlying(assets, assetSymbols.BUSD)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.jBRL),
  ],
  // // BOMB
  // [underlying(assets, assetSymbols.BOMB)]: [
  //   FundingStrategyContract.XBombLiquidator,
  //   underlying(assets, assetSymbols.xBOMB)
  // ]
};

export default fundingStrategies;

import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import { assets } from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: don't add hard assets as the output from a funding strategy?
  // TODO: extract to predefined chained paths
  // jarvis
  [underlying(assets, assetSymbols.jBRL)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
  // BOMB
  [underlying(assets, assetSymbols.xBOMB)]: [
    FundingStrategyContract.XBombLiquidator,
    underlying(assets, assetSymbols.BOMB),
  ],
};

export default fundingStrategies;

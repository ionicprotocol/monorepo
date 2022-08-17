import { assetSymbols, FundingStrategyContract, underlying } from "@midas-capital/types";

import assets from "./assets";

const fundingStrategies: { [token: string]: [FundingStrategyContract, string] } = {
  // TODO: extract to predefined chained paths
  // jarvis
  [underlying(assets, assetSymbols.jBRL)]: [
    FundingStrategyContract.JarvisLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
  // BOMB
  [underlying(assets, assetSymbols.xBOMB)]: [
    FundingStrategyContract.XBombLiquidatorFunder,
    underlying(assets, assetSymbols.BOMB),
  ],
};

export default fundingStrategies;

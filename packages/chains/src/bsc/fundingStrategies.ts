import {assetSymbols, FundingStrategyContract, RedemptionStrategyContract, underlying} from "@midas-capital/types";

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
  [underlying(assets, assetSymbols.MAI)]: [
    FundingStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.val3EPS),
  ],
  [underlying(assets, assetSymbols.val3EPS)]: [
    RedemptionStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
};

export default fundingStrategies;

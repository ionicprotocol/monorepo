import { assetSymbols, FundingStrategyContract, underlying } from "@ionicprotocol/types";

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
  [underlying(assets, assetSymbols.BRZ)]: [
    FundingStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.jBRL),
  ],
  [underlying(assets, assetSymbols.val3EPS)]: [
    FundingStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
  [underlying(assets, assetSymbols.JCHF)]: [
    FundingStrategyContract.CurveSwapLiquidatorFunder,
    underlying(assets, assetSymbols.BUSD),
  ],
};

export default fundingStrategies;

import { assetSymbols, FundingStrategy, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import assets from "./assets";

const fundingStrategies: FundingStrategy[] = [
  // TODO: extract to predefined chained paths
  // jarvis
  {
    outputToken: underlying(assets, assetSymbols.jBRL),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    outputToken: underlying(assets, assetSymbols.MAI),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.val3EPS)
  },
  {
    outputToken: underlying(assets, assetSymbols.BRZ),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.jBRL)
  },
  {
    outputToken: underlying(assets, assetSymbols.val3EPS),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.BUSD)
  }
];

export default fundingStrategies;

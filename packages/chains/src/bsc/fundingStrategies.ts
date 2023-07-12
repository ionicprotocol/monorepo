import { assetSymbols, FundingStrategy, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import assets from "./assets";

const fundingStrategies: FundingStrategy[] = [
  // TODO: extract to predefined chained paths
  // jarvis
  {
    inputToken: underlying(assets, assetSymbols.jBRL),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BUSD),
  },
  // BOMB
  {
    inputToken: underlying(assets, assetSymbols.xBOMB),
    strategy: FundingStrategyContract.XBombLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BOMB),
  },
  {
    inputToken: underlying(assets, assetSymbols.MAI),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.val3EPS),
  },
  {
    inputToken: underlying(assets, assetSymbols.BRZ),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.jBRL),
  },
  {
    inputToken: underlying(assets, assetSymbols.val3EPS),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BUSD),
  },
  {
    inputToken: underlying(assets, assetSymbols.JCHF),
    strategy: FundingStrategyContract.CurveSwapLiquidatorFunder,
    outputToken: underlying(assets, assetSymbols.BUSD),
  },
];

export default fundingStrategies;

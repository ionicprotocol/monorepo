import { assetSymbols, FundingStrategy, FundingStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const fundingStrategies: FundingStrategy[] = [
  // TODO: group by input token or configure as predefined paths
  {
    outputToken: underlying(assets, assetSymbols.JEUR),
    strategy: FundingStrategyContract.JarvisLiquidatorFunder,
    inputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    outputToken: underlying(assets, assetSymbols.PAR),
    strategy: FundingStrategyContract.UniswapV3LiquidatorFunder, // or CurveSwapLiquidatorFunder
    inputToken: underlying(assets, assetSymbols.USDC)
  }
];

export default fundingStrategies;

import {
  assetSymbols,
  ChainFundingStrategy,
  FundingStrategyContract,
  SupportedChains,
  underlying,
} from "@midas-capital/types";

import { bscAssets } from "./assets";

const chainFundingStrategies: ChainFundingStrategy = {
  [SupportedChains.bsc]: {
    [underlying(bscAssets, assetSymbols.jBRL)]: [
      FundingStrategyContract.JarvisLiquidatorFunder,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
  },
  [SupportedChains.chapel]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
};

export default chainFundingStrategies;

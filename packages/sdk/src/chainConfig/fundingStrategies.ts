import {
  ChainFundingStrategy,
  FundingStrategyContract,
  RedemptionStrategyContract,
  SupportedChains,
} from "@midas-capital/types";

import { assetSymbols, bscAssets } from "./assets";
import { underlying } from "./supportedAssets";

const chainFundingStrategies: ChainFundingStrategy = {
  [SupportedChains.bsc]: {
    [underlying(bscAssets, assetSymbols.jBRL)]: [
      FundingStrategyContract.JarvisLiquidatorFunder,
      underlying(bscAssets, assetSymbols.BUSD),
    ],
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
};

export default chainFundingStrategies;

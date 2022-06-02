import { RedemptionStrategy, SupportedChains } from "../enums";
import { ChainRedemptionStrategy, SupportedAsset } from "../types";

import { assetSymbols, bscAssets, moonbeamAssets } from "./assets";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    // dai3EPS
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.dai3EPS)!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // 3EPS
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["3EPS"])!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // ust3EPS
    // "0x151F1611b2E304DEd36661f65506f9D7D172beba": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // xBOMB
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.BOMB)!.underlying]:
      RedemptionStrategy.XBombLiquidator,
    // jBRL
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.jBRL)!.underlying]:
      RedemptionStrategy.jBRLLiquidator,
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
  },
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
  },
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
};

export default chainRedemptionStrategies;

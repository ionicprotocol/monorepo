import { RedemptionStrategy, SupportedChains } from "../enums";
import { ChainRedemptionStrategy, SupportedAsset } from "../types";

import { assetSymbols, bscAssets, moonbeamAssets } from "./assets";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["3EPS"])!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["2brl"])!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.val3EPS)!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.valdai3EPS)!.underlying]:
      RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // xBOMB
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.BOMB)!.underlying]:
      RedemptionStrategy.XBombLiquidator,
    // jBRL
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.jBRL)!.underlying]:
      RedemptionStrategy.JarvisSynthereumLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-DAI"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDC"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDT"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-ETH"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,

    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-USDT"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-BTCB"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-BUSD"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-ETH"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,

    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-ETH"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,

    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["CAKE-WBNB"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      RedemptionStrategy.UniswapLpTokenLiquidator,
  },
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

import { RedemptionStrategyContract, SupportedChains } from "../enums";
import { ChainRedemptionStrategy, SupportedAsset } from "../types";

import { assetSymbols, bscAssets, moonbeamAssets } from "./assets";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["3EPS"])!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["2brl"])!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.val3EPS)!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.valdai3EPS)!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.BOMB)!.underlying]:
      [RedemptionStrategyContract.XBombLiquidator, assetSymbols.xBOMB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.xBOMB)!.underlying]:
      [RedemptionStrategyContract.XBombLiquidator, assetSymbols.BOMB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.jBRL)!.underlying]:
      [RedemptionStrategyContract.JarvisSynthereumLiquidator, assetSymbols.BUSD],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-DAI"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDC"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-USDT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.BUSD],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-BTCB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.BUSD],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.BUSD],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.USDC],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.BTCB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.BTCB],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["CAKE-WBNB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.WBNB],
  },
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.GLMR],
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, assetSymbols.GLMR],
  },
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "ignored"],
  },
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
};

export default chainRedemptionStrategies;

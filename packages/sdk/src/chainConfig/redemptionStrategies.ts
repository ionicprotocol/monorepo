import { RedemptionStrategyContract, SupportedChains } from "../enums";
import { ChainRedemptionStrategy, SupportedAsset } from "../types";

import { assetSymbols, bscAssets, moonbeamAssets } from "./assets";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["3EPS"])!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["2brl"])!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.val3EPS)!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.valdai3EPS)!.underlying]:
      [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.BOMB)!.underlying]:
      [RedemptionStrategyContract.XBombLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.jBRL)!.underlying]:
      [RedemptionStrategyContract.JarvisSynthereumLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-DAI"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDC"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-USDT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-USDT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BUSD-BTCB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["BTCB-ETH"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["CAKE-WBNB"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {
    [bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
  },
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
    [moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying]:
      [RedemptionStrategyContract.UniswapLpTokenLiquidator, "//TODO"],
  },
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": [RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry, "//TODO"],
  },
  [SupportedChains.ganache]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
};

export default chainRedemptionStrategies;

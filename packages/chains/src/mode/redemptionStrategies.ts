import { assetSymbols, RedemptionStrategy, RedemptionStrategyContract, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDT),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDC),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.USDT)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.USDT)
  },
  {
    inputToken: underlying(assets, assetSymbols.USDT),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  },
  {
    inputToken: underlying(assets, assetSymbols.WETH),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.WBTC)
  },
  {
    inputToken: underlying(assets, assetSymbols.WBTC),
    strategy: RedemptionStrategyContract.KimUniV2Liquidator,
    outputToken: underlying(assets, assetSymbols.WETH)
  }
];

export default redemptionStrategies;

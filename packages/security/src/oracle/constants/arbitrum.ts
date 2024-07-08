import { assetSymbols } from "@ionicprotocol/types";

import { ChainLinkAssetConfig } from "../scorers/chainlink/types";

export const chainLinkOracleAssetMappings: ChainLinkAssetConfig = {
  defaultValidatorNumber: 10,
  chainLinkApiResponseKey: {
    networkName: "arbitrum-price-feeds",
    networkIndex: 0,
  },
  symbolMappings: {
    "BAL / USD": assetSymbols.BAL,
    "BNB / USD": assetSymbols.BNB,
    "CRV / USD": assetSymbols.CRV,
    "DAI / USD": assetSymbols.DAI,
    "FRAX / USD": assetSymbols.FRAX,
    "USDT/ USD": assetSymbols.USDT,
    "USDC / USD": assetSymbols.USDC,
    "ETH / USD": assetSymbols.WETH,
    "FXS / USD": assetSymbols.FXS,
    "LINK / USD": assetSymbols.LINK,
    "SUSHI / USD": assetSymbols.SUSHI,
    "BTC / USD": assetSymbols.WBTC,
    "MAGIC / USD": assetSymbols.MAGIC,
    "DPX / USD": assetSymbols.DPX,
  },
};

// 100 = 0.01%
// 500 = 0.05%
// 3000 = 0.3%
// 10000 = 1%

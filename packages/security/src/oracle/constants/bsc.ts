import { assetSymbols } from "@ionicprotocol/types";

import { ChainLinkAssetConfig } from "../scorers/chainlink/types";

export const chainLinkOracleAssetMappings: ChainLinkAssetConfig = {
  defaultValidatorNumber: 16,
  chainLinkApiResponseKey: {
    networkName: "bnb-chain",
    networkIndex: 0,
  },
  symbolMappings: {
    "BNB / USD": assetSymbols.WBNB,
    "BUSD / USD": assetSymbols.BUSD,
    "BTCB / USD": assetSymbols.BTCB,
    "DAI / USD": assetSymbols.DAI,
    "ETH / USD": assetSymbols.ETH,
    "BETH / USD": assetSymbols.BETH,
    "CAKE / USD": assetSymbols.CAKE,
    "AUTO / USD": assetSymbols.AUTO,
    "BIFI / USD": assetSymbols.BIFI,
    "ALPACA / USD": assetSymbols.ALPACA,
    "USDC / USD": assetSymbols.USDC,
    "USDT / USD": assetSymbols.USDT,
    "TUSD / USD": assetSymbols.TUSD,
  },
};

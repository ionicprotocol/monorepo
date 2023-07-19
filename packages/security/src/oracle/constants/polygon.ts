import { assetSymbols } from "@ionicprotocol/types";

import { ChainLinkAssetConfig } from "../scorers/chainlink/types";

export const chainLinkOracleAssetMappings: ChainLinkAssetConfig = {
  defaultValidatorNumber: 16,
  chainLinkApiResponseKey: {
    networkName: "polygon",
    networkIndex: 0,
  },
  symbolMappings: {
    "AAVE / USD": assetSymbols.AAVE,
    "ALCX / USD": assetSymbols.ALCX,
    "BAL / USD": assetSymbols.BAL,
    "BNB / USD": assetSymbols.oBNB,
    "BUSD / USD": assetSymbols.BUSD,
    "CRV / USD": assetSymbols.CRV,
    "CVX / USD": assetSymbols.CVX,
    "DAI / USD": assetSymbols.DAI,
    "FRAX / USD": assetSymbols.FRAX,
    "ETH / USD": assetSymbols.WETH,
    "FTM / USD": assetSymbols.FTM,
    "FXS / USD": assetSymbols.FXS,
    "GHST / USD": assetSymbols.GHST,
    "GRT / USD": assetSymbols.GRT,
    "LINK / USD": assetSymbols.LINK,
    "MAI / USD": assetSymbols.MAI,
    "MKR / USD": assetSymbols.MKR,
    "RAI / USD": assetSymbols.RAI,
    "SNX / USD": assetSymbols.SNX,
    "SOL / USD": assetSymbols.SOL,
    "SUSHI / USD": assetSymbols.SUSHI,
    "YFI / USD": assetSymbols.YFI,
    "USDC / USD": assetSymbols.USDC,
    "USDT / USD": assetSymbols.USDT,
    "BTC / USD": assetSymbols.WBTC,
    "AGEUR / USD": assetSymbols.AGEUR,
    "EUR / USD": [assetSymbols.JEUR, assetSymbols.PAR, assetSymbols.EURT],
  },
};

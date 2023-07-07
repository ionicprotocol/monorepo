import { assetSymbols } from "@ionicprotocol/types";

import { ChainLinkAssetConfig } from "../scorers/chainlink/types";

export const chainLinkOracleAssetMappings: ChainLinkAssetConfig = {
  defaultValidatorNumber: 16,
  chainLinkApiResponseKey: {
    networkName: "bnb-chain-addresses-price",
    networkIndex: 0,
  },
  symbolMappings: {
    "ATOM / USD": assetSymbols.ATOM,
    "BNB / USD": assetSymbols.BNB,
    "DOT / USD": assetSymbols.xcDOT,
    "ETH / USD": assetSymbols.ETH,
    "FRAX / USD": assetSymbols.FRAX,
    "USDC / USD": assetSymbols.multiUSDC,
  },
};

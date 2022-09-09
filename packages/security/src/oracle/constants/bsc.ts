import { assetSymbols } from "@midas-capital/types";

import { ChainLinkAssetConfig } from "../../types";

export const chainLinkOracleAssetMappings: ChainLinkAssetConfig = {
  defaultValidatorNumber: 16,
  chainLinkApiResponseKey: {
    networkName: "bnb-chain-addresses-price",
    networkIndex: 0,
  },
  symbolMappings: [
    { [assetSymbols.WBNB]: "BNB / USD" },
    { [assetSymbols.BUSD]: "BUSD / USD" },
    { [assetSymbols.BTCB]: "BTCB / USD" },
    { [assetSymbols.DAI]: "DAI / USD" },
    { [assetSymbols.ETH]: "ETH / USD" },
    { [assetSymbols.BETH]: "BETH / USD" },
    { [assetSymbols.CAKE]: "CAKE / USD" },
    { [assetSymbols.AUTO]: "AUTO / USD" },
    { [assetSymbols.BIFI]: "BIFI / USD" },
    { [assetSymbols.ALPACA]: "ALPACA / USD" },
    { [assetSymbols.USDC]: "USDC / USD" },
    { [assetSymbols.USDT]: "USDT / USD" },
    { [assetSymbols.TUSD]: "TUSD / USD" },
  ],
};

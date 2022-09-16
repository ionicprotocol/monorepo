import { arbitrum } from "@midas-capital/chains";
import { assetFilter, assetSymbols } from "@midas-capital/types";

import { ChainLinkAssetConfig } from "../scorers/chainlink/types";
import { UniswapV3AssetConfig } from "../scorers/uniswapV3/types";

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

const GMX = assetFilter(arbitrum.assets, assetSymbols.GMX);

export const uniswapV3OracleAssetMappings: UniswapV3AssetConfig[] = [
  {
    token: {
      address: GMX.underlying,
      symbol: GMX.symbol,
      decimals: GMX.decimals,
    },
    targetPriceImpact: 20,
  },
];

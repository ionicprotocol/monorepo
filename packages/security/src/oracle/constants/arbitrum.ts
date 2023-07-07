import { arbitrum } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols } from "@ionicprotocol/types";
import Decimal from "decimal.js";

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
    targetPriceImpact: new Decimal(20),
    baseToken: arbitrum.chainAddresses.W_TOKEN,
    fee: 10000,
    cardinality: 10,
    attackBlocks: 2,
    inverted: false,
  },
];

// 100 = 0.01%
// 500 = 0.05%
// 3000 = 0.3%
// 10000 = 1%

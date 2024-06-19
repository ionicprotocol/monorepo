import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  OracleTypes,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
export const USDT = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";
export const OP = "0x4200000000000000000000000000000000000042";
export const wstETH = "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb";
export const SNX = "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4";
export const WBTC = "0x68f180fcCe6836688e9084f035309E29Bf0A2095";
export const LUSD = "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.optimism)
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://optimistic.etherscan.io", USDC),
    oracleSpecificParams: {
      aggregator: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    }
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x524299Ab0987a7c4B3c8022a35669DdcdC715a10",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://optimistic.etherscan.io", wstETH)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://optimistic.etherscan.io", USDT)
  },
  {
    symbol: assetSymbols.OP,
    underlying: OP,
    name: "Optimism",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x0D276FC14719f9292D5C1eA2198673d1f4269246",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://optimistic.etherscan.io", OP)
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: { feed: "0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3" },
    extraDocs: defaultDocs("https://optimistic.etherscan.io", SNX)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: { feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33" },
    extraDocs: defaultDocs("https://optimistic.etherscan.io", WBTC)
  },
  {
    symbol: assetSymbols.LUSD,
    underlying: LUSD,
    name: "LUSD Stablecoin",
    decimals: 18,
    oracle: OracleTypes.RedstoneAdapterPriceOracle,
    extraDocs: defaultDocs("https://optimistic.etherscan.io", LUSD)
  }
];

export default assets;

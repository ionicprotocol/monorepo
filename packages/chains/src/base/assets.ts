import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther } from "viem";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const wstETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
export const cbETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
export const ezETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";
export const AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
export const SNX = "0x22e6966B799c4D5B13BE962E1D117b56327FDa66";
export const WBTC = "0x1ceA84203673764244E05693e42E6Ace62bE9BA5";
export const weETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
export const eUSD = "0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4";
export const bsdETH = "0xcb327b99ff831bf8223cced12b1338ff3aa322ff";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.base)
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", USDC)
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xa669E5272E60f78299F4824495cE01a3923f4380",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", wstETH)
  },
  {
    symbol: assetSymbols.cbETH,
    underlying: cbETH,
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x806b4Ac04501c29769051e42783cF04dCE41440b",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", cbETH)
  },
  {
    symbol: assetSymbols.ezETH,
    underlying: ezETH,
    name: "Renzo Restaked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xC4300B7CF0646F0Fe4C5B2ACFCCC4dCA1346f5d8",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", ezETH)
  },
  {
    symbol: assetSymbols.AERO,
    underlying: AERO,
    name: "Aerodrome",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", AERO)
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      aggregator: "0xe3971Ed6F1A5903321479Ef3148B5950c0612075",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", SNX)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", WBTC)
  },
  {
    symbol: assetSymbols.weETH,
    underlying: weETH,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xFC1415403EbB0c693f9a7844b92aD2Ff24775C65",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", weETH)
  },
  {
    symbol: assetSymbols.eUSD,
    underlying: eUSD,
    name: "eUSD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: defaultDocs("https://basescan.org", eUSD),
    initialSupplyCap: parseEther(String(10_000_000)).toString(),
    initialBorrowCap: parseEther(String(8_000_000)).toString()
  },
  {
    symbol: assetSymbols.bsdETH,
    underlying: bsdETH,
    name: "Based ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xC49F0Dd98F38C525A7ce15E73E60675456F3a161",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", bsdETH),
    initialSupplyCap: parseEther(String(6_500)).toString(),
    initialBorrowCap: parseEther(String(5_200)).toString()
  }
];

export default assets;

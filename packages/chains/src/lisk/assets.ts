import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther, parseUnits } from "viem";

import { wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDT = "0x05D032ac25d322df992303dCa074EE7392C117b9";
export const LSK = "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24";
export const USDC = "0xF242275d3a6527d877f2c927a82D9b057609cc71";
export const WBTC = "0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3";
export const ION = "0x3f608A49a3ab475dA7fBb167C1Be6b7a45cD7013";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.lisk),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("100").toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xd2176Dd57D1e200c0A8ec9e575A129b511DBD3AD",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.lisk),
    initialBorrowCap: parseUnits("200000", 6).toString(),
    initialSupplyCap: parseUnits("200000", 6).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.LSK,
    underlying: LSK,
    name: "Lisk",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xa1EbA9E63ed7BA328fE0778cFD67699F05378a96",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.lisk),
    initialBorrowCap: parseEther("100000").toString(),
    initialSupplyCap: parseEther("100000").toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xb4e6A7861067674AC398a26DD73A3c524C602184",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.lisk),
    initialBorrowCap: parseUnits("100000", 6).toString(),
    initialSupplyCap: parseUnits("100000", 6).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x13da43eA89fB692bdB6666F053FeE70aC61A53cd",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.lisk),
    initialBorrowCap: parseUnits("1", 8).toString(),
    initialSupplyCap: parseUnits("1", 8).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.ION,
    underlying: ION,
    name: "Ion",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle
  }
];

export default assets;

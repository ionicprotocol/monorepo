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
    initialBorrowCap: parseEther("47000").toString(),
    initialSupplyCap: parseEther("47000").toString(),
    initialCf: "0.5"
  }
];

export default assets;

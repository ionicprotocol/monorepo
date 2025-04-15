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
export const MTL = "0xBCFc435d8F276585f6431Fc1b9EE9A850B5C00A9";
export const USDCe = "0x51e85d70944256710cb141847f1a04f568c1db0e";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.metalL2),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("100").toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.MTL,
    underlying: MTL,
    name: "Metal",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
      aggregator: "0x5d6f129900b1516A59e59C122C9ba3446E090DB0"
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.metalL2),
    initialBorrowCap: parseUnits("20000", 8).toString(),
    initialSupplyCap: parseUnits("20000", 8).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.USDCe,
    underlying: USDCe,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
      aggregator: "0x374E48C630F815ffa51d3b5e740482f37a40Ef64"
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.metalL2),
    initialBorrowCap: parseUnits("30000", 6).toString(),
    initialSupplyCap: parseUnits("30000", 6).toString(),
    initialCf: "0.5"
  }
];

export default assets;

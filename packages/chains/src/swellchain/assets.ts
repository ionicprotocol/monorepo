import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther } from "viem";

import { wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";
export const rswETH = "0x18d33689AE5d02649a859A1CF16c9f0563975258";
export const weETH = "0xA6cB988942610f6731e664379D15fFcfBf282b44";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.swell),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("5000").toString(),
    initialCf: "0.8"
  },
  {
    symbol: assetSymbols.USDe,
    underlying: USDe,
    name: "USDe",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    initialBorrowCap: parseEther("100000").toString(),
    initialSupplyCap: parseEther("5000000").toString(),
    initialCf: "0.8",
    oracleSpecificParams: {
      aggregator: "0x83c6f7F61A55Fc7A1337AbD45733AD9c1c68076D",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams
  },
  {
    symbol: assetSymbols.rswETH,
    underlying: rswETH,
    name: "rswETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    initialCf: "0.8",
    oracleSpecificParams: {
      aggregator: "0x4BAD96DD1C7D541270a0C92e1D4e5f12EEEA7a57",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    } as ChainlinkSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.swell),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("5000").toString()
  },
  {
    symbol: assetSymbols.weETH,
    underlying: weETH,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x3fd49f2146FE0e10c4AE7E3fE04b3d5126385Ac4",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    } as ChainlinkSpecificParams,
    initialCf: "0.7",
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("5000").toString()
  }
];

export default assets;

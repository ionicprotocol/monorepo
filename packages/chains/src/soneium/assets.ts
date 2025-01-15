import { assetSymbols, OracleTypes, PythSpecificParams, SupportedAsset, SupportedChains } from "@ionicprotocol/types";
import { parseEther, parseUnits } from "viem";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369";
export const ASTR = "0x2CAE934a1e84F693fbb78CA5ED3B0A6893259441";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.soneium),
    initialBorrowCap: parseEther("10").toString(),
    initialSupplyCap: parseEther("5000").toString(),
    initialCf: "0.8"
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USDC",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://soneium.blockscout.com", USDC),
    initialBorrowCap: parseUnits("100000", 6).toString(),
    initialSupplyCap: parseUnits("10000000", 6).toString(),
    initialCf: "0.8"
  },
  {
    symbol: assetSymbols.ASTR,
    underlying: ASTR,
    name: "Astar",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0x89b814de1eb2afd3d3b498d296fca3a873e644bafb587e84d181a01edd682853"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://soneium.blockscout.com", ASTR),
    initialBorrowCap: parseEther("160000").toString(),
    initialSupplyCap: parseEther("16000000").toString(),
    initialCf: "0.5"
  }
];

export default assets;

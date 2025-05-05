import { assetSymbols, OracleTypes, PythSpecificParams, SupportedAsset, SupportedChains } from "@ionicprotocol/types";
import { parseEther, parseUnits } from "viem";

import { wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xc316c8252b5f2176d0135ebb0999e99296998f2e";
export const oUSDT = "0x1217bfe6c773eec6cc4a38b5dc45b92292b6e189";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.superseed),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("100").toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
    } as PythSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.superseed),
    initialBorrowCap: parseUnits("20000", 6).toString(),
    initialSupplyCap: parseUnits("40000", 6).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.oUSDT,
    underlying: oUSDT,
    name: "OpenUSDT",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0x2dc7f272d3010abe4de48755a50fcf5bd9eefd3b4af01d8f39f6c80ae51544fe"
    } as PythSpecificParams,
    extraDocs: wrappedAssetDocs(SupportedChains.superseed),
    initialBorrowCap: parseUnits("20000", 6).toString(),
    initialSupplyCap: parseUnits("40000", 6).toString(),
    initialCf: "0.5"
  }
];

export default assets;

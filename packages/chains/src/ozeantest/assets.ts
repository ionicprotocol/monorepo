import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";
import { parseEther } from "viem";

import { wrappedAssetDocs } from "../common";

export const WUSDX = "0x4200000000000000000000000000000000000006";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WUSDX,
    underlying: WUSDX,
    name: "Wrapped USDX",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.ozeantest),
    initialBorrowCap: parseEther("100").toString(),
    initialSupplyCap: parseEther("100").toString(),
    initialCf: "0.5"
  }
];

export default assets;

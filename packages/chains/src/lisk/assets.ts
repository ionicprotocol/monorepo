import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";
import { parseEther } from "viem";

import { wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.base),
    initialBorrowCap: parseEther("1").toString(),
    initialSupplyCap: parseEther("1").toString(),
    initialCf: "0.5"
  }
];

export default assets;

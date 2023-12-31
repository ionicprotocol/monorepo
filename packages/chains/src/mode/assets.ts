import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.mode)
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network/", USDC)
  }
];

export default assets;

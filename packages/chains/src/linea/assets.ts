import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WBTC = "0xDbcd5BafBAA8c1B326f14EC0c8B125DB57A5cC4c";
export const USDC = "0xf56dc6695cF1f5c364eDEbC7Dc7077ac9B586068";
export const WETH = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f";
export const DAI = "0x8741Ba6225A6BF91f9D73531A98A89807857a2B3";
export const USDT = "0x1990BC6dfe2ef605Bfc08f5A23564dB75642Ad73";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("hhttps://explorer.linea.build/", USDC)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 18,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("hhttps://explorer.linea.build/", WBTC)
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.linea)
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "DAI Token",
    decimals: 18,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("hhttps://explorer.linea.build/", DAI)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "USD Tether",
    decimals: 6,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("hhttps://explorer.linea.build/", USDT)
  }
];

export default assets;

import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WBTC = "0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4";
export const USDC = "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";
export const WETH = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f";
export const DAI = "0x4AF15ec2A0BD43Db75dd04E62FAA3B8EF36b00d5";
export const USDT = "0xA219439258ca9da29E9Cc4cE5596924745e12B93";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("https://lineascan.build/", USDC)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("https://lineascan.build/", USDT)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.UmbrellaPriceOracle,
    extraDocs: defaultDocs("https://lineascan.build/", WBTC)
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
    oracle: OracleTypes.AlgebraPriceOracle,
    extraDocs: defaultDocs("https://lineascan.build/", DAI),
    disabled: true
  }
];

export default assets;

import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x74A4A85C611679B73F402B36c0F84A7D2CcdFDa3";
export const USDC = "0x5fd84259d66Cd46123540766Be93DFE6D43130D7";
export const USDT = "0xF10Bd4fF61E8A9362059324de40260Ace7D4c16b";
export const WBTC = "0xa447e73d1F67eABeD4281F440D49dD2928a76A4f";
export const PYTH_BTC = "0x3745007F7C8DD8Bec89b3B35f33f13f58b008533";
export const PYTH_USDC = "0x1e3d75F24296abBC7bd10D151F51d758bCE379Ef";

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
    underlying: PYTH_USDC,
    name: "USD Coin",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", PYTH_USDC)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", USDT)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", WBTC)
  },
  {
    symbol: assetSymbols.BTC,
    underlying: PYTH_BTC,
    name: "Bitcoin",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", WBTC)
  }
];

export default assets;

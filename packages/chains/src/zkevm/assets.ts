import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9";
export const WBTC = "0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1";
export const USDC = "0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035";
export const USDT = "0x1E4a5963aBFD975d8c9021ce480b42188849D41d";
export const DAI = "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4";
export const FRAX = "0xFf8544feD5379D9ffa8D47a74cE6b91e632AC44D";
export const WMATIC = "0xa2036f0538221a77A3937F1379699f44945018d0";

export const rETH = "0xb23C20EFcE6e24Acca0Cef9B7B7aA196b84EC942";
export const sfrxETH = "0x7c2aF1Fb79D0b1c67d4eb802d44C673D0A1D2C04";
export const wstETH = "0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", USDC)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.AlgebraPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", WBTC)
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.zkevm)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", USDT)
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax Stablecoin",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", FRAX)
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "DAI Stablecoin",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", DAI)
  },
  {
    symbol: assetSymbols.WMATIC,
    underlying: WMATIC,
    name: "Wrapped Matic",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", WMATIC)
  },
  {
    symbol: assetSymbols.sfrxETH,
    underlying: sfrxETH,
    name: "Staked Frax Ether",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", sfrxETH)
  },
  {
    symbol: assetSymbols.rETH,
    underlying: rETH,
    name: "Rocket Pool ETH",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", rETH)
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped liquid staked Ether",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://zkevm.polygonscan.com", wstETH)
  }
];

export default assets;

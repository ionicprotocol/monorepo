import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@midas-capital/types";

import { ankrCertificateDocs, beethovenXDocs, curveFinanceFantomDocs, defaultDocs, wrappedAssetDocs } from "../common";

export const aFTMc = "0xCfC785741Dc0e98ad4c9F6394Bb9d43Cd1eF5179";
const BNB = "0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454";
export const multiBTC = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
const multiETH = "0x74b23882a30290451A17c44f4F05243b6b58C76d";
export const USDC = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
export const DAI = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E";
export const PAR = "0x13082681E8CE9bd0aF505912d306403592490Fc7";
export const WFTM = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
const MAI = "0xfB98B335551a418cD0737375a2ea0ded62Ea213b";
const PAR_USDC_CURVE = "0x43363B5b640284da0BB8e2c545e43C1583277022";
const MIMO_PAR_75_25 = "0x851553FD9BCd28Befe450d3cfbB3f86F13832a1d";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.aFTMc,
    underlying: aFTMc,
    name: "Ankr FTM Reward Bearing Certificate",
    decimals: 18,
    oracle: OracleTypes.AnkrCertificateTokenPriceOracle,
    extraDocs: ankrCertificateDocs("aFTMc", "FTM"),
  },
  {
    symbol: assetSymbols.BNB,
    underlying: BNB,
    name: "Binance Network",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", BNB),
  },
  {
    symbol: assetSymbols.multiBTC,
    underlying: multiBTC,
    name: "multichain BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", multiBTC),
  },
  {
    symbol: assetSymbols.multiETH,
    underlying: multiETH,
    name: "Multichain Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", multiETH),
  },
  {
    symbol: assetSymbols.WFTM,
    underlying: WFTM,
    name: "Wrapped Fantom",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: wrappedAssetDocs(SupportedChains.fantom),
  },
  {
    symbol: assetSymbols.MAI,
    underlying: MAI,
    name: "miMATIC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", MAI),
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", DAI),
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", USDC),
  },
  {
    symbol: assetSymbols.PAR,
    underlying: PAR,
    name: "PAR Stablecoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://ftmscan.com", USDC),
  },
  {
    symbol: assetSymbols.PAR_USDC_CURVE,
    underlying: PAR_USDC_CURVE,
    name: "PAR/USDC Curve LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveV2LpTokenPriceOracleNoRegistry,
    extraDocs: curveFinanceFantomDocs("https://ftmscan.com", "factory-crypto-7"),
  },
  {
    symbol: assetSymbols.MIMO_PAR_75_25,
    underlying: MIMO_PAR_75_25,
    name: "75MIMO-25PAR",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: beethovenXDocs(
      "0x851553fd9bcd28befe450d3cfbb3f86f13832a1d000200000000000000000211",
      "PAR25 - MIMO75",
      MIMO_PAR_75_25
    ),
  },
];

export default assets;

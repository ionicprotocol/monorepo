import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

import { defaultDocs } from "../common";

export const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
export const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";

const BAL = "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8";
const BNB = "0x20865e63B111B2649ef829EC220536c82C58ad7B";
const CRV = "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978";
const DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const FRAX = "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F";
const FXS = "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7";
const LINK = "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4";

// no price feed
// const MAI = "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d";

const SUSHI = "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", BAL),
  },
  {
    symbol: assetSymbols.BNB,
    underlying: BNB,
    name: "Binance Network",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", BNB),
  },
  {
    symbol: assetSymbols.CRV,
    underlying: CRV,
    name: "Curve DAO Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", CRV),
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", DAI),
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", WETH),
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", FRAX),
  },
  {
    symbol: assetSymbols.FXS,
    underlying: FXS,
    name: "Frax Share",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", FXS),
  },

  {
    symbol: assetSymbols.LINK,
    underlying: LINK,
    name: "ChainLink Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", LINK),
  },
  {
    symbol: assetSymbols.SUSHI,
    underlying: SUSHI,
    name: "SushiToken",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", SUSHI),
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin (Arb1)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", USDC),
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", USDT),
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.com", WBTC),
  },
];

export default assets;

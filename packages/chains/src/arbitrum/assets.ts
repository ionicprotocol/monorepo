import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { curveFinanceArbitrumDocs, defaultDocs, saddleFinanceDocs, wrappedAssetDocs } from "../common";

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
const DPX = "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55";
const GOHM = "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1";
const OHM = "0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028";
const wstETH = "0x5979D7b546E38E414F7E9822514be443A4800529";
const MAGIC = "0x539bdE0d7Dbd336b79148AA742883198BBF60342";
const GMX = "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a";
const USDs = "0xD74f5255D557944cf7Dd0E45FF521520002D5748";

// no price feed
// const MAI = "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d";
// const USX = "0x641441c631e2F909700d2f41FD87F0aA6A6b4EDb";
// const alUSD = "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A";

const SUSHI = "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

// Curve
const TWOPOOL = "0x7f90122BF0700F9E7e1F688fe926940E8839F353";

// Saddle
const saddleFraxBP = "0x896935B02D3cBEb152192774e4F1991bb1D2ED3f";
const saddleFraxUsdsBP = "0x1e491122f3C096392b40a4EA27aa1a29360d38a1";
const saddleFraxUsdtBP = "0x166680852ae9Dec3d63374c5eBf89E974448BFE9";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", BAL),
  },
  {
    symbol: assetSymbols.BNB,
    underlying: BNB,
    name: "Binance Network",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", BNB),
  },
  {
    symbol: assetSymbols.CRV,
    underlying: CRV,
    name: "Curve DAO Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", CRV),
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", DAI),
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: wrappedAssetDocs(SupportedChains.arbitrum),
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", FRAX),
  },
  {
    symbol: assetSymbols.FXS,
    underlying: FXS,
    name: "Frax Share",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", FXS),
  },

  {
    symbol: assetSymbols.LINK,
    underlying: LINK,
    name: "ChainLink Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", LINK),
  },
  {
    symbol: assetSymbols.SUSHI,
    underlying: SUSHI,
    name: "SushiToken",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", SUSHI),
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin (Arb1)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", USDC),
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", USDT),
  },
  {
    symbol: assetSymbols.USDs,
    underlying: USDs,
    name: "Sperax USD",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://arbiscan.io", USDs),
  },
  // Awaiting price feeds
  // {
  //   symbol: assetSymbols.USX,
  //   underlying: USX,
  //   name: "dForce USD",
  //   decimals: 18,
  //   oracle: OracleTypes.UniswapV3PriceOracle,
  //   extraDocs: defaultDocs("https://arbiscan.io", USX),
  // },
  // {
  //   symbol: assetSymbols.asUSD,
  //   underlying: alUSD,
  //   name: "Alchemix USD",
  //   decimals: 18,
  //   oracle: OracleTypes.UniswapV3PriceOracle,
  //   extraDocs: defaultDocs("https://arbiscan.io", alUSD),
  // },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", WBTC),
  },
  {
    symbol: assetSymbols.GOHM,
    underlying: GOHM,
    name: "Governance OHM",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", GOHM),
    disabled: true,
  },
  {
    symbol: assetSymbols.DPX,
    underlying: DPX,
    name: "Dopex Governance Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", DPX),
  },
  {
    symbol: assetSymbols.MAGIC,
    underlying: MAGIC,
    name: "MAGIC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", MAGIC),
  },
  {
    symbol: assetSymbols.GMX,
    underlying: GMX,
    name: "GMX",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://arbiscan.io", GMX),
    disabled: true,
  },
  {
    symbol: assetSymbols.OHM,
    underlying: OHM,
    name: "Olympus",
    decimals: 9,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", OHM),
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Lido Wrapped Staked Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://arbiscan.io", wstETH),
  },
  // Curve LP tokens
  {
    symbol: assetSymbols["2pool"],
    underlying: TWOPOOL,
    name: "Curve.fi USDC/USDT",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinanceArbitrumDocs("2pool", TWOPOOL),
  },
  // Saddle LP tokens
  {
    symbol: assetSymbols["saddleFraxBP"],
    underlying: saddleFraxBP,
    name: "Saddle Frax/USDC",
    decimals: 18,
    oracle: OracleTypes.SaddleLpPriceOracle,
    extraDocs: saddleFinanceDocs("FRAX-USDC-BP", saddleFraxBP),
  },
  {
    symbol: assetSymbols["saddleFraxUsdsBP"],
    underlying: saddleFraxUsdsBP,
    name: "Saddle Frax/USDS",
    decimals: 18,
    oracle: OracleTypes.SaddleLpPriceOracle,
    extraDocs: saddleFinanceDocs("FRAXBP-USDs", saddleFraxUsdsBP),
    disabled: true,
  },
  {
    symbol: assetSymbols["saddleFraxUsdtBP"],
    underlying: saddleFraxUsdtBP,
    name: "Saddle Frax/USDT",
    decimals: 18,
    oracle: OracleTypes.SaddleLpPriceOracle,
    extraDocs: saddleFinanceDocs("FRAXBP-USDT", saddleFraxUsdtBP),
  },
];

export default assets;

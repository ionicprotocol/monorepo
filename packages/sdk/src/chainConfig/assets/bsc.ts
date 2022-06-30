import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WBNB,
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    name: "Wrapped Binance Network Token",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    name: "Binance USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.BTCB,
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    name: "Binance BTC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    name: "Binance DAI",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    name: "Binance ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  // CZ
  {
    symbol: assetSymbols.BETH,
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    name: "Binance Beacon ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.CAKE,
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    name: "PancakeSwap Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  //
  {
    symbol: assetSymbols.AUTO,
    underlying: "0xa184088a740c695E156F91f5cC086a06bb78b827",
    name: "AUTOv2",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.BIFI,
    underlying: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    name: "beefy.finance",
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    decimals: 18,
  },
  {
    symbol: assetSymbols.ALPACA,
    underlying: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
    name: "AlpacaToken",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  // stables
  {
    symbol: assetSymbols.USDC,
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    name: "Binance-Peg USD Coin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.USDT,
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    name: "Binance-Peg BSC-USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.TUSD,
    underlying: "0x14016e85a25aeb13065688cafb43044c2ef86784",
    name: "Wrapped TrueUSD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  // Ellipsis
  {
    symbol: assetSymbols["3EPS"],
    underlying: "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452",
    name: "Ellipsis.finance 3EPS (BUSD/USDC/USDT)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },
  {
    symbol: assetSymbols.val3EPS,
    underlying: "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5",
    name: "Ellipsis.finance val3EPS (BUSD/USDC/USDT)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },
  {
    symbol: assetSymbols.valdai3EPS,
    underlying: "0x8087a94FFE6bcF08DC4b4EBB3d28B4Ed75a792aC",
    name: "Ellipsis.finance valdai3EPS (DAI, val3EPS)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },

  {
    symbol: assetSymbols["2brl"],
    underlying: "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9",
    name: "Ellipsis.finance 2BRL (BRZ, jBRL)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },
  // Bomb
  {
    symbol: assetSymbols.BOMB,
    underlying: "0x522348779DCb2911539e76A1042aA922F9C47Ee3",
    name: "BOMB",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
  },
  {
    symbol: assetSymbols.xBOMB,
    underlying: "0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b",
    name: "xBOMB",
    decimals: 18,
  },
  {
    symbol: assetSymbols["BTCB-BOMB"],
    underlying: "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6",
    name: "BOMB-BTC PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  // Jarvis
  {
    symbol: assetSymbols.jBRL,
    underlying: "0x316622977073BBC3dF32E7d2A9B3c77596a0a603",
    name: "Jarvis Synthetic Brazilian Real",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.BRZ,
    underlying: "0x71be881e9C5d4465B3FfF61e89c6f3651E69B5bb",
    name: "BRZ Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols["WBNB-BUSD"],
    underlying: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16",
    name: "WBNB-BUSD PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["WBNB-DAI"],
    underlying: "0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3",
    name: "WBNB-DAI PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["WBNB-USDC"],
    underlying: "0xd99c7F6C65857AC913a8f880A4cb84032AB2FC5b",
    name: "WBNB-USDC PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["WBNB-USDT"],
    underlying: "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE",
    name: "WBNB-USDT PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["USDC-ETH"],
    underlying: "0xEa26B78255Df2bBC31C1eBf60010D78670185bD0",
    name: "USDC-ETH PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["BUSD-BTCB"],
    underlying: "0xF45cd219aEF8618A92BAa7aD848364a158a24F33",
    name: "BUSD-BTCB PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
];

export default assets;

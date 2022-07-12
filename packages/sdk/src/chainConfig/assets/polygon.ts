import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WMATIC,
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    name: "Binance Network Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  //   {
  //     symbol: assetSymbols.BNB,
  //     underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  //     name: "Binance Network Token",
  //     decimals: 18,
  //     oracle: OracleTypes.ChainlinkPriceOracleV2,
  //   },
  //   {
  //     symbol: assetSymbols.BUSD,
  //     underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  //     name: "Binance USD",
  //     decimals: 18,
  //     oracle: OracleTypes.ChainlinkPriceOracleV2,
  //   },
  //   {
  //     symbol: assetSymbols.BTCB,
  //     underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  //     name: "Binance BTC",
  //     decimals: 18,
  //     oracle: OracleTypes.ChainlinkPriceOracleV2,
  //   },
  //   {
  //     symbol: assetSymbols.DAI,
  //     underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  //     name: "Binance DAI",
  //     decimals: 18,
  //     oracle: OracleTypes.ChainlinkPriceOracleV2,
  //   },
  //   {
  //     symbol: assetSymbols.ETH,
  //     underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  //     name: "Binance ETH",
  //     decimals: 18,
  //     oracle: OracleTypes.ChainlinkPriceOracleV2,
  //   },
];

export default assets;

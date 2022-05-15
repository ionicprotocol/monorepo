import { SupportedAsset } from "../../Fuse/types";
import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WEVMOS,
    underlying: "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
    name: "Wrapped EVMOS ",
    decimals: 18,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
    name: "Wrapped ETH ",
    decimals: 18,
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
    name: "Binance USD",
    decimals: 18,
  },
  {
    symbol: assetSymbols.BTCB,
    underlying: "0x6ce8da28e2f864420840cf74474eff5fd80e65b8",
    name: "Binance BTC",
    decimals: 18,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
    name: "Binance DAI",
    decimals: 18,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x8babbb98678facc7342735486c851abd7a0d17ca",
    name: "Binance ETH",
    decimals: 18,
  },
  {
    symbol: assetSymbols.USDT,
    underlying: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684",
    name: "Tether USD",
    decimals: 18,
  },
  {
    symbol: assetSymbols.SAFEMOON,
    underlying: "0xDAcbdeCc2992a63390d108e8507B98c7E2B5584a",
    name: "SafeMoon",
    decimals: 9,
  },
];

export default assets;

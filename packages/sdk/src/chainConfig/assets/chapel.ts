import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WBNB,
    underlying: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    name: "Wrapped BNB ",
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
    underlying: "0x8a9424745056Eb399FD19a0EC26A14316684e274",
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
  {
    symbol: assetSymbols["WBNB-BUSD"],
    underlying: "0xe0e92035077c39594793e61802a350347c320cf2",
    name: "WBNB-BUSD PCS LP",
    decimals: 18,
  },
  {
    symbol: assetSymbols["WBNB-DAI"],
    underlying: "0xAE4C99935B1AA0e76900e86cD155BFA63aB77A2a",
    name: "WBNB-DAI PCS LP",
    decimals: 18,
  },
  {
    symbol: assetSymbols["BUSD-USDT"],
    underlying: "0xaF9399F70d896dA0D56A4B2CbF95F4E90a6B99e8",
    name: "WBNB-DAI PCS LP",
    decimals: 18,
  },
];

export default assets;

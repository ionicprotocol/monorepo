import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WBNB,
    underlying: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    name: "Wrapped BNB ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
    name: "Binance USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.BTCB,
    underlying: "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",
    name: "Binance BTC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0x8a9424745056Eb399FD19a0EC26A14316684e274",
    name: "Binance DAI",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x8BaBbB98678facC7342735486C851ABD7A0d17Ca",
    name: "Binance ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.USDT,
    underlying: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684",
    name: "Tether USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.SAFEMOON,
    underlying: "0xDAcbdeCc2992a63390d108e8507B98c7E2B5584a",
    name: "SafeMoon",
    decimals: 9,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
  },
  {
    symbol: assetSymbols["WBNB-BUSD"],
    underlying: "0xe0e92035077c39594793e61802a350347c320cf2",
    name: "WBNB-BUSD PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["WBNB-DAI"],
    underlying: "0xAE4C99935B1AA0e76900e86cD155BFA63aB77A2a",
    name: "WBNB-DAI PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols["BUSD-USDT"],
    underlying: "0x5126C1B8b4368c6F07292932451230Ba53a6eB7A",
    name: "WBNB-DAI PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
  },
  {
    symbol: assetSymbols.BOMB,
    underlying: "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768",
    name: "Testing Bomb",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
];

export default assets;

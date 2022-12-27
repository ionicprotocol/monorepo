import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

const WNEON = "0xf1041596da0499c3438e3B1Eb7b95354C6Aed1f5";
const MORA = "0x6dcDD1620Ce77B595E6490701416f6Dbf20D2f67";
const USDC = "0x6Ab1F83c0429A1322D7ECDFdDf54CE6D179d911f";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WNEON,
    underlying: WNEON,
    name: "Wrapped NEON ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.MORA,
    underlying: MORA,
    name: "Moraswap Token",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
];

export default assets;

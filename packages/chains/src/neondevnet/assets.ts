import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

const WNEON = "0xCaDA7B93FDd60787aF0Dfc9A5eC9861D621aB1EF";
const MORA = "0x6Ab1F83c0429A1322D7ECDFdDf54CE6D179d911f";
const USDC = "0x7ff459CE3092e8A866aA06DA88D291E2E31230C1";

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
    name: "Wrapped Ethereum (Sollet)",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
];

export default assets;

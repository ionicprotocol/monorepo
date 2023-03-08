import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

const WETH = "0x44D627f900da8AdaC7561bD73aA745F132450798";
const USDC = "0x5CDeAA74e9CCc9D5eEAB8166eb955505634D2a4e";
const BTCb = "0x6B090A1DF9aeDfFdb90fB53850Fe794510F3A04C";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped ETH ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: BTCb,
    name: "BTC Base Token",
    decimals: 8,
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

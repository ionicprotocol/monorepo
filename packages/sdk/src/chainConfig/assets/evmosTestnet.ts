import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WEVMOS,
    underlying: "0xA30404AFB4c43D25542687BCF4367F59cc77b5d2",
    name: "Wrapped EVMOS ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0xD933ee21fb77877DbCdDe9DA53Ce82491a8Cd58b",
    name: "DAI Stablecoin",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x95A1f87865A082202b95306434e246a3124Af25c",
    name: "USD Coin ",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDT,
    underlying: "0x965403Ee904c5A04c55Ad941F52b8fDf734f5554",
    name: "Tether USD",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: "0x595b8DF4eF99f9eb6da0206aa165e8136E4E7770",
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.saddleOptFraxUSD,
    underlying: "0x2CA49510481f9b310b67A728d73B30c01dB4B825",
    name: "FRAX metapool",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },
  {
    symbol: assetSymbols.saddleOptUSD,
    underlying: "0x9449e017c075507d25AE2e4C67e58f390828521A",
    name: "USD pool",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  },
];

export default assets;

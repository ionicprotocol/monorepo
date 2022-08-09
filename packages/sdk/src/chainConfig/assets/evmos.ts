import { OracleTypes, SupportedAsset } from "@midas-capital/types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WEVMOS,
    underlying: "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
    name: "Wrapped EVMOS ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.USDT,
    underlying: "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e",
    name: "Tether USD",
    decimals: 18,
    oracle: OracleTypes.FluxPriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82",
    name: "USD Coin ",
    decimals: 18,
    oracle: OracleTypes.FluxPriceOracle,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
    name: "ETH",
    decimals: 18,
    oracle: OracleTypes.FluxPriceOracle,
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8",
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.FluxPriceOracle,
  },
];

export default assets;

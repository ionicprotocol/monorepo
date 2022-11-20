import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WEVMOS,
    underlying: "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
    name: "Wrapped EVMOS ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.gUSDT,
    underlying: "0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265",
    name: "Gravity Bridged USDT",
    decimals: 18,
    oracle: OracleTypes.AdrastiaPriceOracle,
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

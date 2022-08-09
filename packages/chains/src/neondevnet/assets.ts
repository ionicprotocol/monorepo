import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WNEON,
    underlying: "0xf8aD328E98f85fccbf09E43B16dcbbda7E84BEAB",
    name: "Wrapped NEON ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: "0x6fbF8F06Ebce724272813327255937e7D1E72298",
    name: "Wrapped BTC (Wormhole)",
    decimals: 8,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.WETH,
    underlying: "0x65976a250187cb1D21b7e3693aCF102d61c86177",
    name: "Wrapped Ethereum (Sollet)",
    decimals: 8,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0x7aD98AeADbbCdF3693B0b53C09dA4033704C9322",
    name: "Dai Stablecoin (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.BAL,
    underlying: "0xC60911b5577F10F582914205d61C64622A6924d8",
    name: "Balancer (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x816459aAd9C378f2A5413b421F53d3503f867E87",
    name: "USDC",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
];
export default assets;

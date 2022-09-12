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
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.AAVE,
    underlying: "0x9E7C05e787bAC79730EcA196CFab2b1b53F2Ff47",
    name: "Wrapped AAVE (AAVE)",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x2578C6c1ac883443388edd688ca10E87d088BfA8",
    name: "USDC",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
];
export default assets;

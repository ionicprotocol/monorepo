import { OracleTypes, SupportedAsset } from "@midas-capital/types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WNEON,
    underlying: "0xf8ad328e98f85fccbf09e43b16dcbbda7e84beab",
    name: "Wrapped NEON ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: "0x6fbf8f06ebce724272813327255937e7d1e72298",
    name: "Wrapped BTC (Wormhole)",
    decimals: 8,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.WETH,
    underlying: "0x65976a250187cb1d21b7e3693acf102d61c86177",
    name: "Wrapped Ethereum (Sollet)",
    decimals: 8,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.DAI,
    underlying: "0x7ad98aeadbbcdf3693b0b53c09da4033704c9322",
    name: "Dai Stablecoin (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.BAL,
    underlying: "0xc60911b5577f10f582914205d61c64622a6924d8",
    name: "Balancer (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.SimplePriceOracle,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x816459aad9c378f2a5413b421f53d3503f867e87",
    name: "USDC",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle,
  },
];

export default assets;

import { assetSymbols, OracleTypes, SupportedAsset } from "@ionicprotocol/types";

const WNEON = "0x202C35e517Fa803B537565c40F0a6965D7204609";
// const MORA = "0x2043191e10a2A4b4601F5123D6C94E000b5d915F";
const USDC = "0xEA6B04272f9f62F997F666F07D3a974134f7FFb9";
const USDT = "0x5f0155d08eF4aaE2B500AefB64A3419dA8bB611a";
const WBTC = "0x54EcEC9D995A6CbFF3838F6a8F38099E518805d7";
const WETH = "0xcFFd84d468220c11be64dc9dF64eaFE02AF60e8A";
const SOL = "0x5f38248f339Bf4e84A2caf4e4c0552862dC9F82a";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WNEON,
    underlying: WNEON,
    name: "Wrapped NEON ",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle
  },
  // {
  //   symbol: assetSymbols.MORA,
  //   underlying: MORA,
  //   name: "Moraswap Token",
  //   decimals: 18,
  //   oracle: OracleTypes.ChainlinkPriceOracleV2
  // },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.SimplePriceOracle
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "USD Tether",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Eth (Wormhole)",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Btc (Sollet)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  },
  {
    symbol: assetSymbols.SOL,
    underlying: SOL,
    name: "Wrapped Solana",
    decimals: 9,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  }
];

export default assets;

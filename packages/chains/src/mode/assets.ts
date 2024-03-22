import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0xd988097fb8612cc24eeC14542bC03424c656005f";
export const USDT = "0xf0F161fDA2712DB8b566946122a5af183995e2eD";
export const WBTC = "0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF";
export const UNI = "0x3e7eF8f50246f725885102E8238CBba33F276747";
export const SNX = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
export const LINK = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
export const DAI = "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea";
export const BAL = "0xD08a2917653d4E460893203471f0000826fb4034";
export const AAVE = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2";
export const ezETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";
export const weETH = "0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.mode)
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", USDC)
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", USDT)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", WBTC)
  },
  {
    symbol: assetSymbols.ezETH,
    underlying: ezETH,
    name: "Renzo Restaked ETH",
    decimals: 18,
    oracle: OracleTypes.RedstoneAdapterPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", ezETH)
  },
  {
    symbol: assetSymbols.weETH,
    underlying: weETH,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.RedstoneAdapterPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", weETH)
  },
  {
    symbol: assetSymbols.UNI,
    underlying: UNI,
    name: "Uniswap Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", UNI)
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", SNX)
  },
  {
    symbol: assetSymbols.LINK,
    underlying: LINK,
    name: "Chainlink Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", LINK)
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "DAI Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", DAI)
  },
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", BAL)
  },
  {
    symbol: assetSymbols.AAVE,
    underlying: AAVE,
    name: "AAVE Token",
    decimals: 18, // TODO verify
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", AAVE)
  }
];

export default assets;

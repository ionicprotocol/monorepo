import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const wstETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
export const cbETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
export const ezETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";
export const AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
export const SNX = "0x22e6966B799c4D5B13BE962E1D117b56327FDa66";
export const WBTC = "0x1ceA84203673764244E05693e42E6Ace62bE9BA5";
export const weETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.base)
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", USDC)
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", wstETH)
  },
  {
    symbol: assetSymbols.cbETH,
    underlying: cbETH,
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", cbETH)
  },
  {
    symbol: assetSymbols.ezETH,
    underlying: ezETH,
    name: "Renzo Restaked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", ezETH)
  },
  {
    symbol: assetSymbols.AERO,
    underlying: AERO,
    name: "Aerodrome",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", AERO)
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://basescan.org", SNX)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", WBTC)
  },
  {
    symbol: assetSymbols.weETH,
    underlying: weETH,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://basescan.org", weETH)
  }
];

export default assets;

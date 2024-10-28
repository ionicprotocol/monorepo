import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther } from "viem";

import { defaultDocs, wrappedAssetDocs } from "../common";

export const WETH = "0x4200000000000000000000000000000000000006";
export const wFRXETH = "0xfc00000000000000000000000000000000000006";
export const sFRXETH = "0xfc00000000000000000000000000000000000005";
export const FXS = "0xfc00000000000000000000000000000000000002";
export const FRAX = "0xfc00000000000000000000000000000000000001";
export const sFRAX = "0xfc00000000000000000000000000000000000008";
export const frxBTC = "0xfc00000000000000000000000000000000000007";
export const insfrxETH = "0xE162075a1C0Ac7e985253972bEcA5e83Da3BBaa4";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.fraxtal),
    initialSupplyCap: parseEther(String(500)).toString(),
    initialBorrowCap: parseEther(String(400)).toString(),
    initialCf: "0.77"
  },
  {
    symbol: assetSymbols.wFRXETH,
    underlying: wFRXETH,
    name: "Wrapped Frax Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x89e60b56efD70a1D4FBBaE947bC33cae41e37A72",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://fraxscan.com", wFRXETH),
    initialSupplyCap: parseEther(String(500)).toString(),
    initialBorrowCap: parseEther(String(400)).toString(),
    initialCf: "0.77"
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xa41107f9259bB835275eaCaAd8048307B80D7c00",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", FRAX),
    initialSupplyCap: parseEther(String(1_500_000)).toString(),
    initialBorrowCap: parseEther(String(1_200_000)).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.FXS,
    underlying: FXS,
    name: "Frax Share",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xbf228a9131AB3BB8ca8C7a4Ad574932253D99Cd1",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", FXS),
    initialSupplyCap: parseEther(String(2_000_000)).toString(),
    initialBorrowCap: parseEther(String(1_600_000)).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.frxBTC,
    underlying: frxBTC,
    name: "Frax Bitcoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", frxBTC),
    initialSupplyCap: parseEther(String(10)).toString(),
    initialBorrowCap: parseEther(String(8)).toString(),
    initialCf: "0.1"
  },
  {
    symbol: assetSymbols.insfrxETH,
    underlying: insfrxETH,
    name: "Inception Restaked sfrxETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x4E0Fce6FF8384241c686C26cA3bcE3A16CDcDB55",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseEther(String(1000)).toString(),
    initialBorrowCap: parseEther(String(800)).toString(),
    initialCf: "0.70"
  }
];

export default assets;

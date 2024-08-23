import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  PythSpecificParams,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther } from "viem";

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
export const weETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
export const wrsETH = "0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd";
export const mBTC = "0x59889b7021243dB5B1e065385F918316cD90D46c";
export const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";
export const ION = "0x18470019bf0e94611f15852f7e93cf5d65bc34ca";
export const KIM = "0x6863fb62Ed27A9DdF458105B507C15b5d741d62e";
export const sUSDe = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";
export const dMBTC = "0x93a397fb0db16BA4bb045a4C08Ee639Cb5639495";

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
    symbol: assetSymbols.wrsETH,
    underlying: wrsETH,
    name: "rsETHWrapper",
    decimals: 18,
    oracle: OracleTypes.RedstoneAdapterWrsETHPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", wrsETH)
  },
  {
    symbol: assetSymbols.MODE,
    underlying: MODE,
    name: "Mode Token",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", MODE)
  },
  {
    symbol: assetSymbols.ION,
    underlying: ION,
    name: "Ionic Token",
    decimals: 18,
    oracle: OracleTypes.VelodromePriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", ION)
  },
  // {
  //   symbol: assetSymbols.KIM,
  //   underlying: KIM,
  //   name: "Kim Token",
  //   decimals: 18,
  //   oracle: OracleTypes.PythPriceOracle,
  //   extraDocs: defaultDocs("https://explorer.mode.network", KIM)
  // },
  {
    symbol: assetSymbols.mBTC,
    underlying: mBTC,
    name: "Merlin BTC",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", mBTC)
  },
  {
    symbol: assetSymbols.sUSDe,
    underlying: sUSDe,
    name: "Staked USDe",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xca3ba9a619a4b3755c10ac7d5e760275aa95e9823d38a84fedd416856cdba37c"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", sUSDe)
  },
  {
    symbol: assetSymbols.USDe,
    underlying: USDe,
    name: "USDe",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x1bB8f2dF000553E5Af2AEd5c42FEd3a73cd5144b",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", USDe),
    initialSupplyCap: parseEther(String(5_000_000)).toString(),
    initialBorrowCap: "1"
  },
  {
    symbol: assetSymbols.dMBTC,
    underlying: dMBTC,
    name: "dMBTC",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", dMBTC)
  }
];

export default assets;

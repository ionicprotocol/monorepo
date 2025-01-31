import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  OracleTypes,
  PythSpecificParams,
  SupportedAsset,
  SupportedChains
} from "@ionicprotocol/types";
import { parseEther, parseUnits } from "viem";

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
export const weETHMode = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
export const weETH = "0x028227c4dd1e5419d11Bb6fa6e661920c519D4F5";
export const wrsETH = "0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd";
export const mBTC = "0x59889b7021243dB5B1e065385F918316cD90D46c";
export const MODE = "0xDfc7C877a950e49D2610114102175A06C2e3167a";
export const ION = "0x18470019bf0e94611f15852f7e93cf5d65bc34ca";
export const KIM = "0x6863fb62Ed27A9DdF458105B507C15b5d741d62e";
export const sUSDe = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";
export const dMBTC = "0x93a397fb0db16BA4bb045a4C08Ee639Cb5639495";
export const STONE = "0x80137510979822322193FC997d400D5A6C747bf7";
export const msDAI = "0x3f51c6c5927B88CDEc4b61e2787F9BD0f5249138";
export const oBTC = "0xe3C0FF176eF92FC225096C6d1788cCB818808b35";
export const uniBTC = "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a";
export const uBTC = "0xd0d1b59CA62cE194E882455Fd36632d6277b192a";
export const LBTC = "0x964dd444e3192F636322229080A576077B06FbA3";

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
    symbol: assetSymbols["weETH.mode"],
    underlying: weETHMode,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.RedstoneAdapterPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", weETHMode)
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
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0x47F8B9002761a6E145eead0d6d9b364a3977FACe",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
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
    extraDocs: defaultDocs("https://explorer.mode.network", dMBTC),
    initialCf: "72.5"
  },
  {
    symbol: assetSymbols.STONE,
    underlying: STONE,
    name: "Stone",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    extraDocs: defaultDocs("https://explorer.mode.network", STONE)
  },
  {
    symbol: assetSymbols.msDAI,
    underlying: msDAI,
    name: "Mode Savings Dai",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x97e0E416dA48a0592E6ea8ac0dfD26D410Ba5C22",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", msDAI),
    initialSupplyCap: parseEther(String(100_000)).toString(),
    initialBorrowCap: parseEther(String(100_000)).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.oBTC,
    underlying: oBTC,
    name: "Obelisk BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x49e47Ff91C510B2029E2E8c45FF784cbb1399508",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", oBTC),
    initialSupplyCap: parseUnits(String(250), 8).toString(),
    initialBorrowCap: parseUnits(String(40), 8).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.uniBTC,
    underlying: uniBTC,
    name: "uniBTC",
    decimals: 8,
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0x4EEB40C0379B8654db64966b2C7C6039486d4F9f",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", uniBTC),
    initialSupplyCap: parseUnits(String(250), 8).toString(),
    initialBorrowCap: parseUnits(String(40), 8).toString(),
    initialCf: "0.5"
  },
  {
    symbol: assetSymbols.uBTC,
    underlying: uBTC,
    name: "uBTC",
    decimals: 8,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://explorer.mode.network", uBTC),
    initialSupplyCap: parseUnits(String(250), 8).toString(),
    initialBorrowCap: parseUnits(String(40), 8).toString(),
    initialCf: "0.5"
  }
];

export default assets;

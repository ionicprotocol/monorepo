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
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const wstETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
export const cbETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
export const ezETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";
export const AERO = "0x940181a94A35A4569E4529A3CDfB74e38FD98631";
export const SNX = "0x22e6966B799c4D5B13BE962E1D117b56327FDa66";
export const WBTC = "0x1ceA84203673764244E05693e42E6Ace62bE9BA5";
export const weETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
export const eUSD = "0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4";
export const bsdETH = "0xcb327b99ff831bf8223cced12b1338ff3aa322ff";
export const RSR = "0xaB36452DbAC151bE02b16Ca17d8919826072f64a";
export const ION = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";
export const hyUSD = "0xCc7FF230365bD730eE4B352cC2492CEdAC49383e";
export const cbBTC = "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf";
export const superOETHb = "0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3";
export const wsuperOETHb = "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6";
export const wUSDM = "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812";
export const OGN = "0x7002458B1DF59EccB57387bC79fFc7C29E22e6f7";
export const EURC = "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42";
export const USDplus = "0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376";
export const wUSDplus = "0xd95ca61CE9aAF2143E81Ef5462C0c2325172E028";
export const USDz = "0x04D5ddf5f3a8939889F11E97f8c4BB48317F1938";
export const uSOL = "0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55";
export const uSUI = "0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4";
export const sUSDz = "0xe31eE12bDFDD0573D634124611e85338e2cBF0cF";
export const fBOMB = "0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979";

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
    oracleSpecificParams: {
      aggregator: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", USDC)
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xa669E5272E60f78299F4824495cE01a3923f4380",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", wstETH)
  },
  {
    symbol: assetSymbols.cbETH,
    underlying: cbETH,
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x806b4Ac04501c29769051e42783cF04dCE41440b",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", cbETH)
  },
  {
    symbol: assetSymbols.ezETH,
    underlying: ezETH,
    name: "Renzo Restaked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xC4300B7CF0646F0Fe4C5B2ACFCCC4dCA1346f5d8",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    extraDocs: defaultDocs("https://basescan.org", ezETH)
  },
  {
    symbol: assetSymbols.AERO,
    underlying: AERO,
    name: "Aerodrome",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", AERO)
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xe3971Ed6F1A5903321479Ef3148B5950c0612075",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", SNX)
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped Bitcoin",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", WBTC)
  },
  {
    symbol: assetSymbols.weETH,
    underlying: weETH,
    name: "Wrapped eETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xFC1415403EbB0c693f9a7844b92aD2Ff24775C65",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    initialCf: "0.70",
    extraDocs: defaultDocs("https://basescan.org", weETH)
  },
  {
    symbol: assetSymbols.eUSD,
    underlying: eUSD,
    name: "eUSD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseEther(String(10_000_000)).toString(),
    initialBorrowCap: parseEther(String(8_000_000)).toString(),
    initialCf: "0.80",
    extraDocs: defaultDocs("https://basescan.org", eUSD)
  },
  {
    symbol: assetSymbols.bsdETH,
    underlying: bsdETH,
    name: "Based ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xC49F0Dd98F38C525A7ce15E73E60675456F3a161",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
    },
    initialSupplyCap: parseEther(String(6_500)).toString(),
    initialBorrowCap: parseEther(String(5_200)).toString(),
    initialCf: "0.70",
    extraDocs: defaultDocs("https://basescan.org", bsdETH)
  },
  {
    symbol: assetSymbols.RSR,
    underlying: RSR,
    name: "Reserve Rights",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xAa98aE504658766Dfe11F31c5D95a0bdcABDe0b1",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialSupplyCap: parseEther(String(180_000_000)).toString(),
    initialBorrowCap: parseEther(String(144_000_000)).toString(),
    initialCf: "0.70",
    extraDocs: defaultDocs("https://basescan.org", RSR)
  },
  {
    symbol: assetSymbols.hyUSD,
    underlying: hyUSD,
    name: "High Yield USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x834c4f996B8a6411AEC0f8a0cF6fAfd4423dBEe2",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseEther(String(200_000)).toString(),
    initialBorrowCap: parseEther(String(160_000)).toString(),
    initialCf: "0.70",
    extraDocs: defaultDocs("https://basescan.org", hyUSD)
  },
  {
    symbol: assetSymbols.cbBTC,
    underlying: cbBTC,
    name: "Coinbase Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialSupplyCap: parseUnits(String(1200), 8).toString(),
    initialBorrowCap: parseUnits(String(900), 8).toString(),
    initialCf: "0.80",
    extraDocs: defaultDocs("https://basescan.org", cbBTC)
  },
  {
    symbol: assetSymbols.superOETHb,
    underlying: superOETHb,
    name: "Super OETH",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: defaultDocs("https://basescan.org", superOETHb)
  },
  {
    symbol: assetSymbols.wsuperOETHb,
    underlying: wsuperOETHb,
    name: "Wrapped Super OETH",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: defaultDocs("https://basescan.org", wsuperOETHb),
    initialSupplyCap: parseEther(String(6000)).toString(),
    initialBorrowCap: parseEther(String(4800)).toString(),
    initialCf: "0.80"
  },
  {
    symbol: assetSymbols.wUSDM,
    underlying: wUSDM,
    name: "Wrapped USDM",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x88Ee016dadDCa8061bf6D566585dF6c8aBfED7bb",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialSupplyCap: parseEther(String(250_000)).toString(),
    initialBorrowCap: parseEther(String(120_000)).toString(),
    initialCf: "0.82",
    extraDocs: defaultDocs("https://basescan.org", wUSDM)
  },
  {
    symbol: assetSymbols.OGN,
    underlying: OGN,
    name: "OGN",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x91D7AEd72bF772A0DA30199B925aCB866ACD3D9e",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", OGN),
    initialCf: "0.77",
    initialSupplyCap: parseEther(String(25_000_000)).toString(),
    initialBorrowCap: parseEther(String(20_000_000)).toString()
  },
  {
    symbol: assetSymbols.EURC,
    underlying: EURC,
    name: "EURC",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", EURC),
    initialCf: "0.85",
    initialSupplyCap: parseUnits(String(13_000_000), 6).toString(),
    initialBorrowCap: parseUnits(String(10_000_000), 6).toString()
  },
  {
    symbol: assetSymbols.USDplus,
    underlying: USDplus,
    name: "USD+",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xd5Ec94430eF4170D819E0996BC53ed40d31638d8",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", USDplus),
    initialCf: "0.85",
    initialSupplyCap: parseUnits(String(40_000_000), 6).toString(),
    initialBorrowCap: parseUnits(String(30_000_000), 6).toString()
  },
  {
    symbol: assetSymbols.wUSDplus,
    underlying: wUSDplus,
    name: "Wrapped USD+",
    decimals: 6,
    oracle: OracleTypes.ERC4626Oracle,
    initialCf: "0.85",
    initialSupplyCap: parseUnits(String(40_000_000), 6).toString(),
    initialBorrowCap: "1"
  },
  {
    symbol: assetSymbols.USDz,
    underlying: USDz,
    name: "USDz",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xe25969e2Fa633a0C027fAB8F30Fc9C6A90D60B48",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialCf: "0.80",
    initialSupplyCap: parseEther(String(13_000_000)).toString(),
    initialBorrowCap: parseEther(String(10_000_000)).toString()
  },
  {
    symbol: assetSymbols.uSOL,
    underlying: uSOL,
    name: "Wrapped Solana",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://basescan.org", uSOL),
    initialBorrowCap: parseEther(String(1000)).toString(),
    initialSupplyCap: parseEther(String(2000)).toString(),
    initialCf: "0.80"
  },
  {
    symbol: assetSymbols.uSUI,
    underlying: uSUI,
    name: "Sui (Universal)",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://basescan.org", uSUI),
    initialBorrowCap: parseEther(String(150_000)).toString(),
    initialSupplyCap: parseEther(String(250_000)).toString(),
    initialCf: "0.70"
  },
  {
    symbol: assetSymbols.sUSDz,
    underlying: sUSDz,
    name: "Staked USDz",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xD89c7fFB39C44b17EAecd8717a75A36c19C07582",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialBorrowCap: parseEther(String(80_000)).toString(),
    initialSupplyCap: parseEther(String(100_000)).toString(),
    initialCf: "0.70"
  }
  // DO NOT ADD TO MARKET UNLESS PROPER ORACLE IS DEPLOYED
  // {
  //   symbol: assetSymbols.ION,
  //   underlying: ION,
  //   name: "Ionic",
  //   decimals: 18,
  //   oracle: OracleTypes.AerodromePriceOracle
  // }
  //////////////////////////////////////////
];

export default assets;

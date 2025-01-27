import {
  assetSymbols,
  ChainlinkFeedBaseCurrency,
  ChainlinkSpecificParams,
  DiaSpecificParams,
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
export const KLIMA = "0xDCEFd8C8fCc492630B943ABcaB3429F12Ea9Fea2";
export const uXRP = "0x2615a94df961278DcbC41Fb0a54fEc5f10a693aE";
export const msETH = "0x7Ba6F01772924a82D9626c126347A28299E98c98";
export const msUSD = "0x526728DBc96689597F85ae4cd716d4f7fCcBAE9d";
export const ionicUSDC = "0x23479229e52Ab6aaD312D0B03DF9F33B46753B5e";
export const ionicWETH = "0x5A32099837D89E3a794a44fb131CBbAD41f87a8C";
export const mBASIS = "0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2";

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
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0x4ba73879B0C073Db595aBE9Ba27104D83f024286",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", USDC)
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked ETH",
    decimals: 18,
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0xDB5d5dE97eD9125283ADa3560FE4f11e996041ab",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
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
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0xb1E7Db061e58Fa039c5C38a7f96e9476c2cfC78a",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
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
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0x15a3694998DDb14815536B8a5F74130CA8f5236A",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialCf: "0.70",
    extraDocs: defaultDocs("https://basescan.org", weETH),
    initialSupplyCap: parseEther(String(1_500)).toString(),
    initialBorrowCap: parseEther(String(1_200)).toString()
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
    initialSupplyCap: parseEther(String(2_500_000)).toString(),
    initialBorrowCap: parseEther(String(2_000_000)).toString(),
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
    initialBorrowCap: parseEther(String(215_000)).toString(),
    initialSupplyCap: parseEther(String(270_000)).toString(),
    initialCf: "0.70"
  },
  {
    symbol: assetSymbols.fBOMB,
    underlying: fBOMB,
    name: "Fantom Bomb",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5", // redstone: https://app.redstone.finance/app/feeds/?search=fbomb&page=1&sortBy=popularity&sortDesc=false&perPage=32
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", fBOMB),
    initialCf: "0.50",
    initialSupplyCap: parseEther(String(20_000_000)).toString(),
    initialBorrowCap: parseEther(String(15_000_000)).toString()
  },
  {
    symbol: assetSymbols.KLIMA,
    underlying: KLIMA,
    name: "Klima DAO",
    decimals: 9,
    oracle: OracleTypes.DiaPriceOracle,
    oracleSpecificParams: {
      feed: "0x12df07B05E9DABE78bD04B90206E31F6f64D75bB",
      key: "KLIMA/USD"
    } as DiaSpecificParams,
    extraDocs: defaultDocs("https://basescan.org", KLIMA),
    initialSupplyCap: parseUnits(String(1_500_000), 9).toString(),
    initialBorrowCap: parseUnits(String(1_200_000), 9).toString(),
    initialCf: "0.55"
  },
  {
    symbol: assetSymbols.uXRP,
    underlying: uXRP,
    name: "Wrapped XRP",
    decimals: 18,
    oracle: OracleTypes.PythPriceOracle,
    oracleSpecificParams: {
      feed: "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8"
    } as PythSpecificParams,
    extraDocs: defaultDocs("https://basescan.org", uXRP),
    initialBorrowCap: parseEther(String(245_000)).toString(),
    initialSupplyCap: parseEther(String(200_000)).toString(),
    initialCf: "0.65"
  },
  {
    symbol: assetSymbols.ionicUSDC,
    underlying: ionicUSDC,
    name: "Ionic Ecosystem USDC",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: defaultDocs("https://basescan.org", ionicUSDC),
    initialSupplyCap: parseEther(String(10_000_000)).toString(),
    initialBorrowCap: "1",
    initialCf: "0.80"
  },
  {
    symbol: assetSymbols.ionicWETH,
    underlying: ionicWETH,
    name: "Ionic Ecosystem WETH",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: defaultDocs("https://basescan.org", ionicWETH),
    initialSupplyCap: parseEther(String(2_000)).toString(),
    initialBorrowCap: "1",
    initialCf: "0.80"
  },
  {
    symbol: assetSymbols.mBASIS,
    underlying: mBASIS,
    name: "Midas Basis Trading Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x6d62D3C3C8f9912890788b50299bF4D2C64823b6",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    extraDocs: defaultDocs("https://basescan.org", mBASIS),
    initialSupplyCap: parseEther(String(1_000_000)).toString(),
    initialBorrowCap: parseEther(String(100_000)).toString(),
    initialCf: "0.50"
  },
  {
    symbol: assetSymbols.msETH,
    underlying: msETH,
    name: "Metronome Synth ETH",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: defaultDocs("https://basescan.org", msETH),
    initialCf: "0.10",
    initialSupplyCap: parseEther(String(2000)).toString(),
    initialBorrowCap: parseEther(String(1600)).toString()
  },
  {
    symbol: assetSymbols.msUSD,
    underlying: msUSD,
    name: "Metronome Synth USD",
    decimals: 18,
    oracle: OracleTypes.eOracle,
    oracleSpecificParams: {
      aggregator: "0x4ba73879B0C073Db595aBE9Ba27104D83f024286",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    initialCf: "0.10",
    initialSupplyCap: parseEther(String(5_000_000)).toString(),
    initialBorrowCap: parseEther(String(4_000_000)).toString()
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

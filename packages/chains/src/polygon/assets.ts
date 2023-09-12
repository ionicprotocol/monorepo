import { assetOriginalSymbols, assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@ionicprotocol/types";

import {
  arrakisDocs,
  balancerDocs,
  curveFinancePolygonDocs,
  defaultDocs,
  jarvisDocs,
  quickSwapDocs,
  tangibleDocsUsdr,
  wrappedAssetDocs
} from "../common";
import {
  ankrCertificateDocs,
  clayStackDocs,
  lidoFinanceDocs,
  oneInchDocs,
  pearlDocs,
  retroAlmGamma,
  StaderXDocs
} from "../common/docs";

export const WBTC = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
export const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
export const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const AAVE = "0xD6DF932A45C0f255f85145f286eA0b292B21C90B";
const ALCX = "0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89";
const BAL = "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3";
const oBNB = "0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4";
const BUSD = "0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7";
const CRV = "0x172370d5Cd63279eFa6d502DAB29171933a610AF";
const CVX = "0x4257EA7637c355F81616050CbB6a9b709fd72683";
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const FRAX = "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89";
const FTM = "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1";
const FXS = "0x1a3acf6D19267E2d3e7f898f42803e90C9219062";
const GHST = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";
const GRT = "0x5fe2B58c013d7601147DcdD68C143A77499f5531";
const LINK = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1";
const MAI = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
const MKR = "0x6f7C932e7684666C9fd1d44527765433e01fF61d";
const RAI = "0x00e5646f60AC6Fb446f621d146B6E1886f002905";
const SNX = "0x50B728D8D964fd00C2d0AAD81718b71311feF68a";
const SOL = "0xd93f7E271cB87c23AaA73edC008A79646d1F9912";
const SUSHI = "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a";
const YFI = "0xDA537104D6A5edd53c6fBba9A898708E465260b6";
const USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const MIMO = "0xADAC33f543267c4D59a8c299cF804c303BC3e4aC";
const IXT = "0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE";
const GNS = "0xE5417Af564e4bFDA1c483642db72007871397896";
const SD = "0x1d734A02eF1e1f5886e66b0673b71Af5B53ffA94";
const USDR = "0x40379a439D4F6795B6fc9aa5687dB461677A2dBa";
const WUSDR = "0x00e8c0E92eB3Ad88189E7125Ec8825eDc03Ab265";
const TNGBL = "0x49e6A20f1BBdfEeC2a8222E052000BbB14EE6007";
const DUSD = "0xEC38621e72D86775a89C7422746de1f52bbA5320";
const CASH = "0x5D066D022EDE10eFa2717eD3D79f22F949F8C175";

// liquid staked assets
const MATICx = "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6";
const stMATIC = "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4";
const aMATICc = "0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58";
const csMATIC = "0xFcBB00dF1d663eeE58123946A30AB2138bF9eb2A";

// Balancer
const MIMO_PAR_80_20 = "0x82d7f08026e21c7713CfAd1071df7C8271B17Eae";
const BRZ_JBRL_STABLE_BLP = "0xE22483774bd8611bE2Ad2F4194078DaC9159F4bA";
const JEUR_PAR_STABLE_BLP = "0x513CdEE00251F39DE280d9E5f771A6eaFebCc88E";
const WMATIC_STMATIC_STABLE_BLP = "0x8159462d255C1D24915CB51ec361F700174cD994";
const WMATIC_CSMATIC_STABLE_BLP = "0x02d2e2D7a89D6c5CB3681cfCb6F7dAC02A55eDA4";
const WMATIC_MATICX_STABLE_BLP = "0xb20fC01D21A50d2C734C4a1262B4404d41fA7BF0";
const MATICX_AAVE_WMATIC_STABLE_BLP = "0xE78b25c06dB117fdF8F98583CDaaa6c92B79E917";
const stMATIC_AAVE_WMATIC_STABLE_BLP = "0x216690738Aac4aa0C4770253CA26a28f0115c595";
const TETU_BOOSTED_STABLE_BLP = "0xb3d658d5b95BF04E2932370DD1FF976fe18dd66A";

// Balancer - linear pools
const TETU_LINEAR_USDT = "0x7c82A23B4C48D796dee36A9cA215b641C6a8709d";
const TETU_LINEAR_USDC = "0xae646817e458C0bE890b81e8d880206710E3c44e";
const TETU_LINEAR_DAI = "0xDa1CD1711743e57Dd57102E9e61b75f3587703da";
const AAVE_LINEAR_WMATIC = "0xE4885Ed2818Cc9E840A25f94F9b2A28169D1AEA7";

// Aave
const amUSDC = "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F";

// Curve
const am3CRV = "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171";

// QuickSwap
const WMATIC_USDC = "0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827";
const WMATIC_USDT = "0x604229c960e5CACF2aaEAc8Be68Ac07BA9dF81c3";
const WMATIC_ETH = "0xadbF1854e5883eB8aa7BAf50705338739e558E5b";
const WMATIC_MATICx = "0xb0e69f24982791dd49e316313fD3A791020B8bF7";
const WETH_WBTC = "0xdC9232E2Df177d7a12FdFf6EcBAb114E2231198D";
const JEUR_PAR = "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97";
const MAI_USDC = "0x160532D2536175d65C03B97b0630A9802c274daD";
const DAI_GNS = "0x6E53cB6942e518376E9e763554dB1A45DDCd25c4";
const IXT_USDT = "0x304e57c752E854E9A233Ae82fcC42F7568b81180";

// stable forex
const AGEUR = "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4";
const JEUR = "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c";
const EURE = "0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6";
const EURT = "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f";
const PAR = "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128";
const BRZ = "0x4eD141110F6EeeAbA9A1df36d8c26f684d2475Dc";
const jBRL = "0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722";

// arrakis vault
const arrakis_USDC_WETH_005 = "0xA173340f1E942c2845bcBCe8EBD411022E18EB13";
const arrakis_WBTC_WETH_005 = "0x590217ef04BcB96FF6Da991AB070958b8F9E77f0";
const arrakis_USDC_PAR_005 = "0xC1DF4E2fd282e39346422e40C403139CD633Aacd";
const arrakis_WMATIC_USDC_005 = "0x4520c823E3a84ddFd3F99CDd01b2f8Bf5372A82a";
const arrakis_USDC_agEUR_001 = "0x1644de0A8E54626b54AC77463900FcFFD8B94542";
const arrakis_WMATIC_WETH_005 = "0xDC0eCA1D69ab51C2B2171C870A1506499081dA5B";
const arrakis_WMATIC_AAVE_03 = "0x3Cc255339a27eFa6c38bEe880F4061AB9b231732";
const arrakis_USDC_MAI_005 = "0x4Fe4d754d1B2feaAd266332CfE3d3fcaa632c953";
const arrakis_USDC_USDT_001 = "0x2817E729178471DBAC8b1FC190b4fd8e6F3984e3";
const arrakis_USDC_USDT_005 = "0x869A75D6F7ae09810c9083684cf22e9A618c8B05";
const arrakis_USDC_DAI_005 = "0x2aF769150510Ad9eb37D2e63e1E483114d995cBA";
const arrakis_WETH_DAI_03 = "0x21F65eA5bf55c48A19b195d5d8CB0f708018Ab6c";

// pearl (solidly)
const solidlyStableAMM_USDR_USDC = "0xD17cb0f162f133e339C0BbFc18c36c357E681D6b";
const solidlyStableAMM_DAI_USDR = "0xBD02973b441Aa83c8EecEA158b98B5984bb1036E";
const solidlyVolatileAMM_MATIC_USDR = "0xB4d852b92148eAA16467295975167e640E1FE57A";
const solidlyVolatileAMM_wUSDR_USDR = "0x8711a1a52c34EDe8E61eF40496ab2618a8F6EA4B";
const solidlyVolatileAMM_TNGBL_USDR = "0x0Edc235693C20943780b76D79DD763236E94C751";
const solidlyVolatileAMM_WETH_USDR = "0x74c64d1976157E7Aaeeed46EF04705F4424b27eC";
const solidlyVolatileAMM_WBTC_USDR = "0xb95E1C22dd965FafE926b2A793e9D6757b6613F4";

// retro (solidly gamma)
const gammaNarrowAMM_USDC_CASH = "0x64e14623CA543b540d0bA80477977f7c2c00a7Ea";
const gammaNarrowAMM_USDC_WETH = "0xe058e1FfFF9B13d3FCd4803FDb55d1Cc2fe07DDC";
const gammaNarrowAMM_WMATIC_MATICX = "0x2589469b7A72802CE02484f053CB6df869eB2689";
const gammaNarrowAMM_WBTC_WETH = "0x336536F5bB478D8624dDcE0942fdeF5C92bC4662";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.AAVE,
    underlying: AAVE,
    name: "AAVE Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", AAVE),
    disabled: true
  },
  {
    symbol: assetSymbols.ALCX,
    underlying: ALCX,
    name: "Alchemix Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", ALCX),
    disabled: true
  },
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", BAL),
    disabled: true
  },
  {
    symbol: assetSymbols.oBNB,
    underlying: oBNB,
    name: "Orbit Bridge BNB",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", oBNB),
    disabled: true
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: BUSD,
    name: "Binance USD (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", BUSD),
    disabled: true
  },
  {
    symbol: assetSymbols.CRV,
    underlying: CRV,
    name: "CRV (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", CRV),
    disabled: true
  },
  {
    symbol: assetSymbols.CVX,
    underlying: CVX,
    name: "CVX (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", CVX),
    disabled: true
  },

  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/DAI")
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", WETH)
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/FRAX")
  },
  {
    symbol: assetSymbols.FTM,
    underlying: FTM,
    name: "Fantom",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", FTM),
    disabled: true
  },
  {
    symbol: assetSymbols.FXS,
    underlying: FXS,
    name: "Frax Share",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", FXS),
    disabled: true
  },
  {
    symbol: assetSymbols.GHST,
    underlying: GHST,
    name: "Aavegotchi GHST Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", GHST),
    disabled: true
  },
  {
    symbol: assetSymbols.GRT,
    underlying: GRT,
    name: "Graph Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", GRT),
    disabled: true
  },
  {
    symbol: assetSymbols.GNS,
    underlying: GNS,
    name: "Gains Network Token",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://polygonscan.com", GNS)
  },
  {
    symbol: assetSymbols.IXT,
    underlying: IXT,
    name: "PlanetIX",
    decimals: 18,
    oracle: OracleTypes.AlgebraPriceOracle,
    extraDocs: defaultDocs("https://polygonscan.com", IXT)
  },
  {
    symbol: assetSymbols.LINK,
    underlying: LINK,
    name: "ChainLink Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", LINK),
    disabled: true
  },
  {
    symbol: assetSymbols.MAI,
    underlying: MAI,
    name: "miMATIC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", MAI)
  },
  {
    symbol: assetSymbols.MKR,
    underlying: MKR,
    name: "Maker DAO",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", MKR),
    disabled: true
  },
  {
    symbol: assetSymbols.RAI,
    underlying: RAI,
    name: "Rai Reflex Index (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", RAI),
    disabled: true
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", SNX),
    disabled: true
  },
  {
    symbol: assetSymbols.SD,
    underlying: SD,
    name: "Stader Labs (PoS)",
    decimals: 18,
    oracle: OracleTypes.AlgebraPriceOracle,
    extraDocs: defaultDocs("https://polygonscan.com", SD),
    disabled: true
  },
  {
    symbol: assetSymbols.SOL,
    underlying: SOL,
    name: "Wrapped SOL (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", SOL),
    disabled: true
  },
  {
    symbol: assetSymbols.SUSHI,
    underlying: SUSHI,
    name: "SushiToken (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/SUSHI"),
    disabled: true
  },
  {
    symbol: assetSymbols.YFI,
    underlying: YFI,
    name: "yearn.finance (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", YFI),
    disabled: true
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin (PoS)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/USDC")
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD (PoS)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/USDT")
  },
  {
    symbol: assetSymbols.DUSD,
    underlying: DUSD,
    name: "Davos",
    decimals: 18,
    oracle: OracleTypes.AlgebraPriceOracle,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/simple/swap/USDC/DAVOS")
  },
  {
    symbol: assetSymbols.CASH,
    underlying: CASH,
    name: "CASH",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can acquire this asset on <a href="https://stabl.fi/swap" target="_blank" style="color: #BCAC83;">stabl.fi</a>.</p>`
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC (PoS)",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/WBTC")
  },
  {
    symbol: assetSymbols.WMATIC,
    underlying: WMATIC,
    name: "Wrapped Matic",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.polygon)
  },
  {
    symbol: assetSymbols.MIMO,
    underlying: MIMO,
    name: "MIMO Parallel Governance Token (PoS) ",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/MIMO")
  },
  {
    symbol: assetSymbols.MATICx,
    underlying: MATICx,
    name: "Liquid Staking Matic (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: StaderXDocs("polygon", "MATICx")
  },

  {
    symbol: assetSymbols.stMATIC,
    underlying: stMATIC,
    name: "Staked MATIC (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: lidoFinanceDocs("polygon", "MATIC", "stMATIC")
  },
  {
    symbol: assetSymbols.aMATICc,
    underlying: aMATICc,
    name: "Ankr MATIC Reward Bearing Certificate",
    decimals: 18,
    oracle: OracleTypes.AnkrCertificateTokenPriceOracle,
    extraDocs: ankrCertificateDocs("aMATICc", "MATIC")
  },
  {
    symbol: assetSymbols.csMATIC,
    underlying: csMATIC,
    name: "ClayStack Staked MATIC",
    decimals: 18,
    oracle: OracleTypes.BalancerRateProviderOracle,
    extraDocs: clayStackDocs("MATIC", "polygon")
  },

  // QuickSwap LPs
  {
    symbol: assetSymbols["WMATIC-USDC"],
    underlying: WMATIC_USDC,
    name: "WMATIC-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, USDC, "WMATIC-USDC", WMATIC_USDC),
    disabled: true
  },
  {
    symbol: assetSymbols["WMATIC-USDT"],
    underlying: WMATIC_USDT,
    name: "WMATIC-USDT LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, USDT, "WMATIC-USDT", WMATIC_USDT),
    disabled: true
  },
  {
    symbol: assetSymbols["WMATIC-ETH"],
    underlying: WMATIC_ETH,
    name: "WMATIC-ETH LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, WETH, "WMATIC-ETH", WMATIC_ETH),
    disabled: true
  },
  {
    symbol: assetSymbols["WMATIC-MATICx"],
    underlying: WMATIC_MATICx,
    name: "WMATIC-MATICx LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, MATICx, "WMATIC-MATICx", WMATIC_MATICx)
  },
  {
    symbol: assetSymbols["WETH-WBTC"],
    underlying: WETH_WBTC,
    name: "WETH-WBTC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WETH, WBTC, "WETH-WBTC", WETH_WBTC),
    disabled: true
  },
  {
    symbol: assetSymbols["MAI-USDC"],
    underlying: MAI_USDC,
    name: "MAI-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(MAI, USDC, "MAI-USDC", MAI_USDC)
  },
  {
    symbol: assetSymbols["DAI-GNS"],
    underlying: DAI_GNS,
    name: "DAI-GNS LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(DAI, GNS, "DAI-GNS", DAI_GNS)
  },
  {
    symbol: assetSymbols["IXT-USDT"],
    underlying: IXT_USDT,
    name: "IXT-USDT LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(IXT, USDT, "IXT-USDT", IXT_USDT)
  },
  // curve.fi LP tokens
  {
    symbol: assetSymbols["JEUR-PAR"],
    underlying: JEUR_PAR,
    name: "Jarvis jEUR-PAR LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(285, "JEUR-PAR", JEUR_PAR, true)
  },
  {
    symbol: assetSymbols.amUSDC,
    underlying: amUSDC,
    name: "AAVE Usdc Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `https://app.aave.com/reserve-overview/?underlyingAsset=${USDC}&marketName=proto_polygon_v3`,
    disabled: true
  },
  {
    symbol: assetSymbols.am3CRV,
    underlying: am3CRV,
    name: "Curve.fi amDAI/amUSDC/amUSDT",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs("aave", "am3CRV", am3CRV, false)
  },
  // Balancer
  {
    symbol: assetSymbols.MIMO_PAR_80_20,
    underlying: MIMO_PAR_80_20,
    name: "80MIMO-20PAR",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x82d7f08026e21c7713cfad1071df7c8271b17eae0002000000000000000004b6",
      "80MIMO-20PAR",
      MIMO_PAR_80_20
    )
  },
  {
    symbol: assetSymbols.WMATIC_MATICX_STABLE_BLP,
    underlying: WMATIC_MATICX_STABLE_BLP,
    name: "WMATIC-MATICX Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0xb20fc01d21a50d2c734c4a1262b4404d41fa7bf000000000000000000000075c",
      "WMATIC-MATICx BLP",
      WMATIC_MATICX_STABLE_BLP
    ),
    originalSymbol: assetOriginalSymbols.WMATIC_MATICX_STABLE_BLP
  },
  {
    symbol: assetSymbols.WMATIC_CSMATIC_STABLE_BLP,
    underlying: WMATIC_CSMATIC_STABLE_BLP,
    name: "WMATIC-csMATIC Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x02d2e2d7a89d6c5cb3681cfcb6f7dac02a55eda400000000000000000000088f",
      "WMATIC-csMATIC BLP",
      WMATIC_CSMATIC_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.WMATIC_STMATIC_STABLE_BLP,
    underlying: WMATIC_STMATIC_STABLE_BLP,
    name: "WMATIC-stMATIC Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d",
      "WMATIC-stMATIC Stable BLP",
      WMATIC_STMATIC_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.BRZ_JBRL_STABLE_BLP,
    underlying: BRZ_JBRL_STABLE_BLP,
    name: "BRZ-jBRL Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0xe22483774bd8611be2ad2f4194078dac9159f4ba0000000000000000000008f0",
      "BRZ-jBRL Stable BLP",
      BRZ_JBRL_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.TETU_BOOSTED_STABLE_BLP,
    underlying: TETU_BOOSTED_STABLE_BLP,
    name: "DAI-USDT-USDC Boosted Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0xb3d658d5b95bf04e2932370dd1ff976fe18dd66a000000000000000000000ace",
      "Tetu Boosted Stable BLP",
      TETU_BOOSTED_STABLE_BLP
    ),
    disabled: true
  },
  {
    symbol: assetSymbols.JEUR_PAR_STABLE_BLP,
    underlying: JEUR_PAR_STABLE_BLP,
    name: "jEUR-PAR Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x513cdee00251f39de280d9e5f771a6eafebcc88e000000000000000000000a6b",
      "jEUR-PAR Stable BLP",
      JEUR_PAR_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.MaticX_bbaWMATIC,
    underlying: MATICX_AAVE_WMATIC_STABLE_BLP,
    name: "MaticX-bbaWMATIC Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0xe78b25c06db117fdf8f98583cdaaa6c92b79e917000000000000000000000b2b",
      "MaticX-bbaWMATIC Stable BLP",
      MATICX_AAVE_WMATIC_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.StMatic_bbaWMATIC,
    underlying: stMATIC_AAVE_WMATIC_STABLE_BLP,
    name: "MaticX-bbaWMATIC Stable BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x216690738aac4aa0c4770253ca26a28f0115c595000000000000000000000b2c",
      "StMatic-bbaWMATIC Stable BLP",
      stMATIC_AAVE_WMATIC_STABLE_BLP
    )
  },
  {
    symbol: assetSymbols.TETU_LINEAR_USDT,
    underlying: TETU_LINEAR_USDT,
    name: "bb-t-USDT Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "https://app.tetu.io/vault/0xf2fB1979C4bed7E71E6ac829801E0A8a4eFa8513",
    disabled: true
  },
  {
    symbol: assetSymbols.TETU_LINEAR_USDC,
    underlying: TETU_LINEAR_USDC,
    name: "bb-t-USDC Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "https://app.tetu.io/vault/0xf2fB1979C4bed7E71E6ac829801E0A8a4eFa8513",
    disabled: true
  },
  {
    symbol: assetSymbols.TETU_LINEAR_DAI,
    underlying: TETU_LINEAR_DAI,
    name: "bb-t-DAI Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "https://app.tetu.io/vault/0xf2fB1979C4bed7E71E6ac829801E0A8a4eFa8513",
    disabled: true
  },
  {
    symbol: assetSymbols.AAVE_LINEAR_WMATIC,
    underlying: AAVE_LINEAR_WMATIC,
    name: "bb-a-WMATIC Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs:
      "https://app.balancer.fi/#/polygon/pool/0xe78b25c06db117fdf8f98583cdaaa6c92b79e917000000000000000000000b2b",
    disabled: true
  },

  // stable forex
  {
    symbol: assetSymbols.AGEUR,
    underlying: AGEUR,
    name: "agEUR Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/agEUR")
  },
  {
    symbol: assetSymbols.JEUR,
    underlying: JEUR,
    name: "Jarvis JEUR Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2")
  },
  {
    symbol: assetSymbols.PAR,
    underlying: PAR,
    name: "PAR Stablecoin (PoS)",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/PAR")
  },
  {
    symbol: assetSymbols.EURT,
    underlying: EURT,
    name: "Euro Tether (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  },
  {
    symbol: assetSymbols.EURE,
    underlying: EURE,
    name: "Monerium EUR emoney",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2
  },
  {
    symbol: assetSymbols.BRZ,
    underlying: BRZ,
    name: "BRZ Token",
    decimals: 4,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>You can acquire BRZ tokens at <a href="https://www.brztoken.io" target="_blank" style="color: #BCAC83; cursor="pointer">https://www.brztoken.io</> or other centralised exchanges</p>`
  },
  {
    symbol: assetSymbols.jBRL,
    underlying: jBRL,
    name: "Jarvis JBRL Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2")
  },
  {
    symbol: assetSymbols.USDR,
    underlying: USDR,
    name: "Real USD ",
    decimals: 9,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: tangibleDocsUsdr("Mint")
  },
  {
    symbol: assetSymbols.WUSDR,
    underlying: WUSDR,
    name: "Wrappd Real USD ",
    decimals: 9,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: tangibleDocsUsdr("Wrap")
  },
  {
    symbol: assetSymbols.TNGBL,
    underlying: TNGBL,
    name: "Tangible ",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://polygonscan.com", TNGBL)
  },
  // Arrakis Vaults
  {
    symbol: assetSymbols["arrakis_USDC_WETH_005"],
    underlying: arrakis_USDC_WETH_005,
    name: "Arrakis Vault V1 USDC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_WETH_005)
  },
  {
    symbol: assetSymbols["arrakis_WBTC_WETH_005"],
    underlying: arrakis_WBTC_WETH_005,
    name: "Arrakis Vault V1 WBTC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WBTC_WETH_005)
  },
  {
    symbol: assetSymbols["arrakis_USDC_PAR_005"],
    underlying: arrakis_USDC_PAR_005,
    name: "Arrakis Vault V1 USDC/PAR 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_PAR_005)
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_USDC_005"],
    underlying: arrakis_WMATIC_USDC_005,
    name: "Arrakis Vault V1 WMATIC/USDC 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_USDC_005)
  },
  {
    symbol: assetSymbols["arrakis_USDC_agEUR_001"],
    underlying: arrakis_USDC_agEUR_001,
    name: "Arrakis Vault V1 USDC/agEUR 0.01",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_agEUR_001)
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_WETH_005"],
    underlying: arrakis_WMATIC_WETH_005,
    name: "Arrakis Vault V1 WMATIC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_WETH_005)
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_AAVE_03"],
    underlying: arrakis_WMATIC_AAVE_03,
    name: "Arrakis Vault V1 WMATIC/AAVE 0.3",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_AAVE_03)
  },
  {
    symbol: assetSymbols["arrakis_USDC_MAI_005"],
    underlying: arrakis_USDC_MAI_005,
    name: "Arrakis Vault V1 USDC/MAI 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_MAI_005)
  },
  {
    symbol: assetSymbols["arrakis_USDC_USDT_001"],
    underlying: arrakis_USDC_USDT_001,
    name: "Arrakis Vault V1 USDC/USDT 0.01",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_USDT_001)
  },
  {
    symbol: assetSymbols["arrakis_USDC_USDT_005"],
    underlying: arrakis_USDC_USDT_005,
    name: "Arrakis Vault V1 USDC/USDT 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_USDT_005)
  },
  {
    symbol: assetSymbols["arrakis_USDC_DAI_005"],
    underlying: arrakis_USDC_DAI_005,
    name: "Arrakis Vault V1 USDC/DAI 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_DAI_005)
  },
  {
    symbol: assetSymbols["arrakis_WETH_DAI_03"],
    underlying: arrakis_WETH_DAI_03,
    name: "Arrakis Vault V1 WETH/DAI 0.3",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WETH_DAI_03)
  },
  {
    symbol: assetSymbols["sAMM-USDC/USDR"],
    underlying: solidlyStableAMM_USDR_USDC,
    name: "Stable AMM - USDC/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyStableAMM_USDR_USDC),
    originalSymbol: assetOriginalSymbols["sAMM-USDC/USDR"]
  },
  {
    symbol: assetSymbols["vAMM-wUSDR/USDR"],
    underlying: solidlyVolatileAMM_wUSDR_USDR,
    name: "Volatile AMM - wUSDR/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyVolatileAMM_wUSDR_USDR),
    originalSymbol: assetOriginalSymbols["vAMM-wUSDR/USDR"]
  },
  {
    symbol: assetSymbols["vAMM-MATIC/USDR"],
    underlying: solidlyVolatileAMM_MATIC_USDR,
    name: "Stable V1 AMM - MATIC/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyVolatileAMM_MATIC_USDR),
    originalSymbol: assetOriginalSymbols["vAMM-MATIC/USDR"]
  },
  {
    symbol: assetSymbols["vAMM-TNGBL/USDR"],
    underlying: solidlyVolatileAMM_TNGBL_USDR,
    name: "Stable V1 AMM - TNGBL/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyVolatileAMM_TNGBL_USDR),
    originalSymbol: assetOriginalSymbols["vAMM-TNGBL/USDR"]
  },
  {
    symbol: assetSymbols["sAMM-DAI/USDR"],
    underlying: solidlyStableAMM_DAI_USDR,
    name: "Stable V1 AMM - DAI/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyStableAMM_DAI_USDR),
    originalSymbol: assetOriginalSymbols["sAMM-DAI/USDR"]
  },
  {
    symbol: assetSymbols["vAMM-WBTC/USDR"],
    underlying: solidlyVolatileAMM_WBTC_USDR,
    name: "Volatile V1 AMM - WBTC/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyVolatileAMM_WBTC_USDR),
    originalSymbol: assetOriginalSymbols["vAMM-WBTC/USDR"]
  },
  {
    symbol: assetSymbols["vAMM-WETH/USDR"],
    underlying: solidlyVolatileAMM_WETH_USDR,
    name: "Volatile V1 AMM - WETH/USDR",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: pearlDocs(solidlyVolatileAMM_WETH_USDR),
    originalSymbol: assetOriginalSymbols["vAMM-WETH/USDR"]
  },
  {
    symbol: assetSymbols.aUSDC_CASH_N,
    underlying: gammaNarrowAMM_USDC_CASH,
    name: "Fusion V2 AMM - Narrow USDC/CASH 0.01%",
    decimals: 18,
    oracle: OracleTypes.GammaPoolUniswapV3PriceOracle,
    extraDocs: retroAlmGamma(USDC, CASH, gammaNarrowAMM_USDC_CASH, "GAMMA_NARROW")
  },
  {
    symbol: assetSymbols.aUSDC_WETH_N,
    underlying: gammaNarrowAMM_USDC_WETH,
    name: "Fusion V2 AMM - Narrow USDC/WETH 0.05%",
    decimals: 18,
    oracle: OracleTypes.GammaPoolUniswapV3PriceOracle,
    extraDocs: retroAlmGamma(USDC, WETH, gammaNarrowAMM_USDC_WETH, "GAMMA_NARROW")
  },
  {
    symbol: assetSymbols.aWMATIC_MATICX_N,
    underlying: gammaNarrowAMM_WMATIC_MATICX,
    name: "Fusion V2 AMM - Narrow WMATIC/MATICx 0.01%",
    decimals: 18,
    oracle: OracleTypes.GammaPoolUniswapV3PriceOracle,
    extraDocs: retroAlmGamma(WMATIC, MATICx, gammaNarrowAMM_WMATIC_MATICX, "GAMMA_NARROW")
  },
  {
    symbol: assetSymbols.aWBTC_WETH_N,
    underlying: gammaNarrowAMM_WBTC_WETH,
    name: "Fusion V2 AMM - Narrow WBTC/WETH 0.05%",
    decimals: 18,
    oracle: OracleTypes.GammaPoolUniswapV3PriceOracle,
    extraDocs: retroAlmGamma(WBTC, WETH, gammaNarrowAMM_WBTC_WETH, "GAMMA_NARROW")
  }
];

export default assets;

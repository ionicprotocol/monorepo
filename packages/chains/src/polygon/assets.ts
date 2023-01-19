import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@midas-capital/types";

import {
  arrakisDocs,
  balancerDocs,
  curveFinancePolygonDocs,
  defaultDocs,
  jarvisDocs,
  quickSwapDocs,
  wrappedAssetDocs,
} from "../common";
import { ankrCertificateDocs, lidoFinanceDocs, oneInchDocs, StaderXDocs } from "../common/docs";

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
const JRT = "0x596eBE76e2DB4470966ea395B0d063aC6197A8C5";

// liquid staked assets
const MATICx = "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6";
const stMATIC = "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4";
const aMATICc = "0x0E9b89007eEE9c958c0EDA24eF70723C2C93dD58";

// Balancer
const MIMO_PAR_80_20 = "0x82d7f08026e21c7713CfAd1071df7C8271B17Eae";
const WMATIC_STMATIC_BLP = "0x8159462d255C1D24915CB51ec361F700174cD994";
const WMATIC_MATICX_BLP = "0xb20fC01D21A50d2C734C4a1262B4404d41fA7BF0";

// Curve
const am3CRV = "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171";

// QuickSwap
const WMATIC_USDC = "0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827";
const WMATIC_USDT = "0x604229c960e5CACF2aaEAc8Be68Ac07BA9dF81c3";
const WMATIC_ETH = "0xadbF1854e5883eB8aa7BAf50705338739e558E5b";
const WMATIC_MATICx = "0xb0e69f24982791dd49e316313fD3A791020B8bF7";
const WETH_WBTC = "0xdC9232E2Df177d7a12FdFf6EcBAb114E2231198D";
const AGEUR_JEUR = "0x2fFbCE9099cBed86984286A54e5932414aF4B717";
const JEUR_PAR = "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97";
const JJPY_JPYC = "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc";
const JCAD_CADC = "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F";
const JSGD_XSGD = "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA";
const JNZD_NZDS = "0x976A750168801F58E8AEdbCfF9328138D544cc09";
const JEUR_EURT = "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1";
const EURE_JEUR = "0x2F3E9CA3bFf85B91D9fe6a9f3e8F9B1A6a4c3cF4";
const MAI_USDC = "0x160532D2536175d65C03B97b0630A9802c274daD";

// stable forex
const AGEUR = "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4";
const JEUR = "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c";
const EURE = "0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6";
const PAR = "0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128";
const EURT = "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f";
const JJPY = "0x8343091F2499FD4b6174A46D067A920a3b851FF9";
const JPYC = "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB";
const JCAD = "0x8ca194A3b22077359b5732DE53373D4afC11DeE3";
const CADC = "0x5d146d8B1dACb1EBBA5cb005ae1059DA8a1FbF57";
const JSGD = "0xa926db7a4CC0cb1736D5ac60495ca8Eb7214B503";
const JCHF = "0xbD1463F02f61676d53fd183C2B19282BFF93D099";
const JMXN = "0xBD1fe73e1f12bD2bc237De9b626F056f21f86427";
const JGBP = "0x767058F11800FBA6A682E73A6e79ec5eB74Fac8c";
const JCNY = "0x84526c812D8f6c4fD6C1a5B68713AFF50733E772";
const JAUD = "0xCB7F1Ef7246D1497b985f7FC45A1A31F04346133";
const JNZD = "0x6b526Daf03B4C47AF2bcc5860B12151823Ff70E0";
const JPLN = "0x08E6d1F0c4877Ef2993Ad733Fc6F1D022d0E9DBf";
const JSEK = "0x197E5d6CcfF265AC3E303a34Db360ee1429f5d1A";
const JKRW = "0xa22f6bc96f13bcC84dF36109c973d3c0505a067E";
const JPHP = "0x486880FB16408b47f928F472f57beC55AC6089d1";
const NZDS = "0xeaFE31Cd9e8E01C8f0073A2C974f728Fb80e9DcE";
const XSGD = "0x769434dcA303597C8fc4997Bf3DAB233e961Eda2";

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

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.AAVE,
    underlying: AAVE,
    name: "AAVE Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", AAVE),
    disabled: true,
  },
  {
    symbol: assetSymbols.ALCX,
    underlying: ALCX,
    name: "Alchemix Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", ALCX),
    disabled: true,
  },
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", BAL),
    disabled: true,
  },
  {
    symbol: assetSymbols.oBNB,
    underlying: oBNB,
    name: "Orbit Bridge BNB",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", oBNB),
    disabled: true,
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: BUSD,
    name: "Binance USD (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", BUSD),
    disabled: true,
  },
  {
    symbol: assetSymbols.CRV,
    underlying: CRV,
    name: "CRV (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", CRV),
    disabled: true,
  },
  {
    symbol: assetSymbols.CVX,
    underlying: CVX,
    name: "CVX (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", CVX),
    disabled: true,
  },

  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/DAI"),
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", WETH),
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/FRAX"),
  },
  {
    symbol: assetSymbols.FTM,
    underlying: FTM,
    name: "Fantom",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", FTM),
    disabled: true,
  },
  {
    symbol: assetSymbols.FXS,
    underlying: FXS,
    name: "Frax Share",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", FXS),
    disabled: true,
  },
  {
    symbol: assetSymbols.GHST,
    underlying: GHST,
    name: "Aavegotchi GHST Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", GHST),
    disabled: true,
  },
  {
    symbol: assetSymbols.GRT,
    underlying: GRT,
    name: "Graph Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", GRT),
    disabled: true,
  },
  {
    symbol: assetSymbols.LINK,
    underlying: LINK,
    name: "ChainLink Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", LINK),
    disabled: true,
  },
  {
    symbol: assetSymbols.MAI,
    underlying: MAI,
    name: "miMATIC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", MAI),
  },
  {
    symbol: assetSymbols.MKR,
    underlying: MKR,
    name: "Maker DAO",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", MKR),
    disabled: true,
  },
  {
    symbol: assetSymbols.RAI,
    underlying: RAI,
    name: "Rai Reflex Index (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", RAI),
    disabled: true,
  },
  {
    symbol: assetSymbols.SNX,
    underlying: SNX,
    name: "Synthetix Network Token (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", SNX),
    disabled: true,
  },
  {
    symbol: assetSymbols.SOL,
    underlying: SOL,
    name: "Wrapped SOL (Wormhole)",
    decimals: 9,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", SOL),
    disabled: true,
  },
  {
    symbol: assetSymbols.SUSHI,
    underlying: SUSHI,
    name: "SushiToken (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/SUSHI"),
    disabled: true,
  },
  {
    symbol: assetSymbols.YFI,
    underlying: YFI,
    name: "yearn.finance (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", YFI),
    disabled: true,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin (PoS)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/USDC"),
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD (PoS)",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/USDT"),
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC (PoS)",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/WBTC"),
  },
  {
    symbol: assetSymbols.WMATIC,
    underlying: WMATIC,
    name: "Wrapped Matic",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.polygon),
  },
  {
    symbol: assetSymbols.MIMO,
    underlying: MIMO,
    name: "MIMO Parallel Governance Token (PoS) ",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/MIMO"),
  },

  {
    symbol: assetSymbols.MATICx,
    underlying: MATICx,
    name: "Liquid Staking Matic (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: StaderXDocs("polygon", "MATICx"),
  },

  {
    symbol: assetSymbols.stMATIC,
    underlying: stMATIC,
    name: "Staked MATIC (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: lidoFinanceDocs("polygon", "MATIC", "stMATIC"),
  },
  {
    symbol: assetSymbols.aMATICc,
    underlying: aMATICc,
    name: "Ankr MATIC Reward Bearing Certificate",
    decimals: 18,
    oracle: OracleTypes.AnkrCertificateTokenPriceOracle,
    extraDocs: ankrCertificateDocs("aMATICc", "MATIC"),
    disabled: true,
  },

  // QuickSwap LPs
  {
    symbol: assetSymbols["WMATIC-USDC"],
    underlying: WMATIC_USDC,
    name: "WMATIC-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, USDC, "WMATIC-USDC", WMATIC_USDC),
    disabled: true,
  },
  {
    symbol: assetSymbols["WMATIC-USDT"],
    underlying: WMATIC_USDT,
    name: "WMATIC-USDT LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, USDT, "WMATIC-USDT", WMATIC_USDT),
    disabled: true,
  },
  {
    symbol: assetSymbols["WMATIC-ETH"],
    underlying: WMATIC_ETH,
    name: "WMATIC-ETH LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, WETH, "WMATIC-ETH", WMATIC_ETH),
    disabled: true,
  },
  {
    symbol: assetSymbols["WMATIC-MATICx"],
    underlying: WMATIC_MATICx,
    name: "WMATIC-MATICx LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WMATIC, MATICx, "WMATIC-MATICx", WMATIC_MATICx),
  },
  {
    symbol: assetSymbols["WETH-WBTC"],
    underlying: WETH_WBTC,
    name: "WETH-WBTC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(WETH, WBTC, "WETH-WBTC", WETH_WBTC),
    disabled: true,
  },
  {
    symbol: assetSymbols["MAI-USDC"],
    underlying: MAI_USDC,
    name: "MAI-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: quickSwapDocs(MAI, USDC, "MAI-USDC", MAI_USDC),
  },
  // curve.fi LP tokens
  {
    symbol: assetSymbols["AGEUR-JEUR"],
    underlying: AGEUR_JEUR,
    name: "Jarvis agEUR-jEUR LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(209, "AGEUR-JEUR", AGEUR_JEUR, true),
  },
  {
    symbol: assetSymbols["JEUR-PAR"],
    underlying: JEUR_PAR,
    name: "Jarvis jEUR-PAR LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(285, "JEUR-PAR", JEUR_PAR, true),
  },
  {
    symbol: assetSymbols["JJPY-JPYC"],
    underlying: JJPY_JPYC,
    name: "Jarvis jJPY-JPYC LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(255, "JJPY-JPYC", JJPY_JPYC, true),
  },
  {
    symbol: assetSymbols["JCAD-CADC"],
    underlying: JCAD_CADC,
    name: "Jarvis jCAD-CADC LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(23, "JCAD-CADC", JCAD_CADC, true),
  },
  {
    symbol: assetSymbols["JSGD-XSGD"],
    underlying: JSGD_XSGD,
    name: "Jarvis jSGD-XSGD LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(22, "JSGD-XSGD", JSGD_XSGD, true),
  },
  {
    symbol: assetSymbols["JNZD-NZDS"],
    underlying: JNZD_NZDS,
    name: "Jarvis JNZD-NZDS LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(228, "JNZD-NZDS", JNZD_NZDS, true),
  },
  {
    symbol: assetSymbols["JEUR-EURT"],
    underlying: JEUR_EURT,
    name: "Jarvis JEUR-EURT LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(286, "JEUR-EURT", JEUR_EURT, true),
  },
  {
    symbol: assetSymbols["EURE-JEUR"],
    underlying: EURE_JEUR,
    name: "Jarvis EURE-JEUR LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs(304, "EURE-JEUR", EURE_JEUR, true),
  },
  {
    symbol: assetSymbols.am3CRV,
    underlying: am3CRV,
    name: "Curve.fi amDAI/amUSDC/amUSDT",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: curveFinancePolygonDocs("aave", "am3CRV", am3CRV, false),
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
    ),
  },
  {
    symbol: assetSymbols.WMATIC_STMATIC_BLP,
    underlying: WMATIC_STMATIC_BLP,
    name: "WMATIC-STMATIC BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d",
      "WMATIC-STMATIC BLP",
      WMATIC_STMATIC_BLP
    ),
  },
  {
    symbol: assetSymbols.WMATIC_MATICX_BLP,
    underlying: WMATIC_MATICX_BLP,
    name: "WMATIC-MATICX BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: balancerDocs(
      "polygon",
      "0xb20fc01d21a50d2c734c4a1262b4404d41fa7bf000000000000000000000075c",
      "WMATIC-MATIX BLP",
      WMATIC_MATICX_BLP
    ),
  },
  // stable forex
  {
    symbol: assetSymbols.AGEUR,
    underlying: AGEUR,
    name: "agEUR Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/agEUR"),
  },
  {
    symbol: assetSymbols.JEUR,
    underlying: JEUR,
    name: "Jarvis JEUR Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.PAR,
    underlying: PAR,
    name: "PAR Stablecoin (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: oneInchDocs("https://app.1inch.io/#/137/unified/swap/MATIC/PAR"),
  },
  {
    symbol: assetSymbols.EURT,
    underlying: EURT,
    name: "Euro Tether (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.EURE,
    underlying: EURE,
    name: "Monerium EUR emoney",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.JJPY,
    underlying: JJPY,
    name: "Jarvis JJPY Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JPYC,
    underlying: JPYC,
    name: "JPY Coin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
  },
  {
    symbol: assetSymbols.JCAD,
    underlying: JCAD,
    name: "Jarvis JCAD Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
    disabled: true,
  },
  {
    symbol: assetSymbols.CADC,
    underlying: CADC,
    name: "CAD Coin (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    disabled: true,
  },
  {
    symbol: assetSymbols.JSGD,
    underlying: JSGD,
    name: "Jarvis JSGD Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JCHF,
    underlying: JCHF,
    name: "Jarvis JCHF Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JMXN,
    underlying: JMXN,
    name: "Jarvis JMXN Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JGBP,
    underlying: JGBP,
    name: "Jarvis JGPB Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JCNY,
    underlying: JCNY,
    name: "Jarvis JCNY Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JAUD,
    underlying: JAUD,
    name: "Jarvis JAUD Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JNZD,
    underlying: JNZD,
    name: "Jarvis JNZD Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JPLN,
    underlying: JPLN,
    name: "Jarvis JPLN Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JSEK,
    underlying: JSEK,
    name: "Jarvis JSEK Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JKRW,
    underlying: JKRW,
    name: "Jarvis JKRW Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.JPHP,
    underlying: JPHP,
    name: "Jarvis JPHP Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v2"),
  },
  {
    symbol: assetSymbols.NZDS,
    underlying: NZDS,
    name: "NZD Stablecoin (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>Learn more on how to acquire NZDS at <a href="https://www.techemynt.com/#buy_nzds" target="_blank" style="color: #BCAC83; cursor="pointer">Techemynt</a></p>`,
  },
  {
    symbol: assetSymbols.XSGD,
    underlying: XSGD,
    name: "StratisX Singapore Dollar (PoS)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>Learn more on how to acquire NZDS at <a href="https://www.straitsx.com/sg/xsgd" target="_blank" style="color: #BCAC83; cursor="pointer">Stratis X</a></p>`,
  },
  // Arrakis Vaults
  {
    symbol: assetSymbols["arrakis_USDC_WETH_005"],
    underlying: arrakis_USDC_WETH_005,
    name: "Arrakis Vault V1 USDC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_WETH_005),
  },
  {
    symbol: assetSymbols["arrakis_WBTC_WETH_005"],
    underlying: arrakis_WBTC_WETH_005,
    name: "Arrakis Vault V1 WBTC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WBTC_WETH_005),
  },
  {
    symbol: assetSymbols["arrakis_USDC_PAR_005"],
    underlying: arrakis_USDC_PAR_005,
    name: "Arrakis Vault V1 USDC/PAR 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_PAR_005),
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_USDC_005"],
    underlying: arrakis_WMATIC_USDC_005,
    name: "Arrakis Vault V1 WMATIC/USDC 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_USDC_005),
  },
  {
    symbol: assetSymbols["arrakis_USDC_agEUR_001"],
    underlying: arrakis_USDC_agEUR_001,
    name: "Arrakis Vault V1 USDC/agEUR 0.01",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_agEUR_001),
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_WETH_005"],
    underlying: arrakis_WMATIC_WETH_005,
    name: "Arrakis Vault V1 WMATIC/WETH 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_WETH_005),
  },
  {
    symbol: assetSymbols["arrakis_WMATIC_AAVE_03"],
    underlying: arrakis_WMATIC_AAVE_03,
    name: "Arrakis Vault V1 WMATIC/AAVE 0.3",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WMATIC_AAVE_03),
  },
  {
    symbol: assetSymbols["arrakis_USDC_MAI_005"],
    underlying: arrakis_USDC_MAI_005,
    name: "Arrakis Vault V1 USDC/MAI 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_MAI_005),
  },
  {
    symbol: assetSymbols["arrakis_USDC_USDT_001"],
    underlying: arrakis_USDC_USDT_001,
    name: "Arrakis Vault V1 USDC/USDT 0.01",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_USDT_001),
  },
  {
    symbol: assetSymbols["arrakis_USDC_USDT_005"],
    underlying: arrakis_USDC_USDT_005,
    name: "Arrakis Vault V1 USDC/USDT 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_USDT_005),
  },

  {
    symbol: assetSymbols["arrakis_USDC_DAI_005"],
    underlying: arrakis_USDC_DAI_005,
    name: "Arrakis Vault V1 USDC/DAI 0.05",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_USDC_DAI_005),
  },
  {
    symbol: assetSymbols["arrakis_WETH_DAI_03"],
    underlying: arrakis_WETH_DAI_03,
    name: "Arrakis Vault V1 WETH/DAI 0.3",
    decimals: 18,
    oracle: OracleTypes.GelatoGUniPriceOracle,
    extraDocs: arrakisDocs("Polygon", 137, arrakis_WETH_DAI_03),
  },
  {
    symbol: assetSymbols.JRT,
    underlying: JRT,
    name: "Jarivs Reward Token",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://polygonscan.com", JRT),
    disabled: true,
  },
];

export default assets;

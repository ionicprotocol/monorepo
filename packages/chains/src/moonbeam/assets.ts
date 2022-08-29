import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

import { beamSwapDocs, beamSwapStableDocs, defaultDocs } from "../common";

const ATOM = "0x27292cf0016E5dF1d8b37306B2A98588aCbD6fCA";
const xcDOT = "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080";
const madWBTC = "0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0";
const stDOT = "0xFA36Fe1dA08C89eC72Ea1F0143a35bFd5DAea108";
const ETH = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const BNB = "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055";
const multiDAI = "0x765277EebeCA2e31912C9946eAe1021199B39C61";
const madDAI = "0xc234A67a4F840E61adE794be47de455361b52413";
const madUSDC = "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9";
const multiUSDC = "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b";
const madUSDT = "0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594";
const multiUSDT = "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73";
const FRAX = "0x322E86852e492a7Ee17f28a78c663da38FB33bfb";
const WGLMR = "0xAcc15dC74880C9944775448304B263D191c6077F";
const GLINT = "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58";
const FTM = "0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327";
const STELLA = "0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2";

// StellaSwap
const GLMR_USDC = "0x555B74dAFC4Ef3A5A1640041e3244460Dc7610d1";
const GLMR_GLINT = "0x99588867e817023162F4d4829995299054a5fC57"; // not supported on stella
const USDC_ETH = "0x0Aa48bF937ee8F41f1a52D225EF5A6F6961e39FA";
const WGLMR_xcDOT = "0xa927E1e1E044CA1D9fe1854585003477331fE2Af";
const GLMR_madUSDC = "0x9bFcf685e641206115dadc0C9ab17181e1d4975c";
const xcDOT_stDOT = "0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685";
const threePool = "0xace58a26b8Db90498eF0330fDC9C2655db0C45E2";
const STELLA_GLMR = "0x7F5Ac0FC127bcf1eAf54E3cd01b00300a0861a62";
const CLEAR_GLMR = "0xd47BeC28365a82C0C006f3afd617012B02b129D6";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.ATOM,
    underlying: ATOM,
    name: "Axelar ATOM",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", ATOM),
  },
  {
    symbol: assetSymbols.madWBTC,
    underlying: madWBTC,
    name: "Nomad Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", madWBTC),
  },
  {
    symbol: assetSymbols.xcDOT,
    underlying: xcDOT,
    name: "ERC20 DOT",
    decimals: 10,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", xcDOT),
  },
  {
    symbol: assetSymbols.stDOT,
    underlying: stDOT,
    name: "Staked ERC20 DOT",
    decimals: 10,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>You can get stDOT by staking your xcDOT on <a href="https://polkadot.lido.fi/" target="_blank" style="color: #BCAC83; cursor="pointer">Lido on Polkadot</a></p>`,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: ETH,
    name: "Multichain ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", ETH),
  },
  {
    symbol: assetSymbols.BNB,
    underlying: BNB,
    name: "Multichain BNB",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", BNB),
  },
  {
    symbol: assetSymbols.multiDAI,
    underlying: multiDAI,
    name: "Multichain DAI Stablecoin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", multiDAI),
  },
  {
    symbol: assetSymbols.madDAI,
    underlying: madDAI,
    name: "Nomad DAI Stablecoin",
    decimals: 6,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", madDAI),
  },
  {
    symbol: assetSymbols.madUSDC,
    underlying: madUSDC,
    name: "Nomad USDC",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", madUSDC),
  },
  {
    symbol: assetSymbols.multiUSDC,
    underlying: multiUSDC,
    name: "Multichain USDC",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", multiUSDC),
  },
  {
    symbol: assetSymbols.madUSDT,
    underlying: madUSDT,
    name: "Nomad USDT",
    decimals: 6,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", madUSDT),
  },
  {
    symbol: assetSymbols.multiUSDT,
    underlying: multiUSDT,
    name: "Multichain USDT",
    decimals: 6,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", multiUSDT),
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", FRAX),
  },
  {
    symbol: assetSymbols.WGLMR,
    underlying: WGLMR,
    name: "Wrapped GLMR",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", WGLMR),
  },
  {
    symbol: assetSymbols.GLINT,
    underlying: GLINT,
    name: "Beamswap Token",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", GLINT),
  },
  {
    symbol: assetSymbols.FTM,
    underlying: FTM,
    name: "Mulitchain Fantom",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: defaultDocs("https://moonbeam.moonscan.io", FTM),
  },
  {
    symbol: assetSymbols["GLMR-USDC"],
    underlying: GLMR_USDC,
    name: "BeamSwap GLMR-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: beamSwapDocs(WGLMR, multiUSDC, "GLMR-USDC", GLMR_USDC),
  },
  {
    symbol: assetSymbols["GLMR-GLINT"],
    underlying: GLMR_GLINT,
    name: "BeamSwap GLMR-GLINT LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: beamSwapDocs(WGLMR, GLINT, "GLMR-GLINT", GLMR_GLINT),
  },
  {
    symbol: assetSymbols["USDC-ETH"],
    underlying: USDC_ETH,
    name: "BeamSwap ETH-USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: beamSwapDocs(multiUSDC, ETH, "USDC-ETH", USDC_ETH),
  },
  {
    symbol: assetSymbols["WGLMR-xcDOT"],
    underlying: WGLMR_xcDOT,
    name: "BeamSwap WGLMR-xcDOT LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: beamSwapDocs(WGLMR, xcDOT, "WGLMR-xcDOT", WGLMR_xcDOT),
  },
  {
    symbol: assetSymbols["GLMR-madUSDC"],
    underlying: GLMR_madUSDC,
    name: "BeamSwap GLMR-madUSDC LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: beamSwapDocs(WGLMR, madUSDC, "GLMR-madUSDC", GLMR_madUSDC),
  },
  {
    symbol: assetSymbols["xcDOT-stDOT"],
    underlying: xcDOT_stDOT,
    name: "Curve.fi xcDOT-stDOT LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: beamSwapDocs(xcDOT, stDOT, "xcDOT-stDOT", xcDOT_stDOT),
  },
  {
    symbol: assetSymbols["3pool"],
    underlying: threePool,
    name: "Curve.fi (nomad) DAI/USDT/USDC LP Token",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: beamSwapStableDocs("nomad3pool", threePool),
  },
  {
    symbol: assetSymbols["STELLA_GLMR"],
    underlying: STELLA_GLMR,
    name: "Stella Swap STELLA/GLMR LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: "",
  },
  {
    symbol: assetSymbols["CLEAR_GLMR"],
    underlying: CLEAR_GLMR,
    name: "Stella Swap CLEAR/GLMR LP Token",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: "",
  },
  {
    symbol: assetSymbols.STELLA,
    underlying: STELLA,
    name: "Stellaswap Token",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: "",
  },
];

export default assets;

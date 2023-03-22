import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@midas-capital/types";

import {
  ankrCertificateDocs,
  apeSwapDocs,
  defaultDocs,
  ellipsisDocs,
  jarvisDocs,
  pancakeSwapDocs,
  StaderXDocs,
  stkBNBDocs,
  thenaDocs,
  wombatDocs,
  wrappedAssetDocs,
} from "../common";

export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const BNB = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const AUTO = "0xa184088a740c695E156F91f5cC086a06bb78b827";
const BIFI = "0xCa3F508B8e4Dd382eE878A314789373D80A5190A";
const ALPACA = "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
const MAI = "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d";
const threeEPS = "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452";
const maiThreeEPS = "0x80D00D2c8d920a9253c3D65BA901250a55011b37";
const twoBRL = "0x1B6E11c5DB9B15DE87714eA9934a6c52371CfEA9";
const threeBRL = "0x27b5Fc5333246F63280dA8e3e533512EfA747c13";
const val3EPS = "0x5b5bD8913D766D005859CE002533D4838B0Ebbb5";
const valdai3EPS = "0x8087a94FFE6bcF08DC4b4EBB3d28B4Ed75a792aC";
const epsBUSD_jCHF = "0x5887cEa5e2bb7dD36F0C06Da47A8Df918c289A29";
const BOMB = "0x522348779DCb2911539e76A1042aA922F9C47Ee3";
const xBOMB = "0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b";
const ankrBNB = "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827";
const stkBNB_WBNB = "0xaA2527ff1893e0D40d4a454623d362B79E8bb7F1";
const stkBNB = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";
const asBNBx_WBNB = "0xB88F211EC9ecfc2931Ae1DE53ea28Da76B9Ed37A";
const asANKR_ankrBNB = "0x653D51dbB4CC8B9Bcd884BB0c0795b4BE672AA4c";
const epsBNBx_BNB = "0x5c73804FeDd39f3388E03F4aa1fE06a1C0e60c8e";
const BNBx = "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275";
const jBRL = "0x316622977073BBC3dF32E7d2A9B3c77596a0a603";
const jCHF = "0x7c869b5A294b1314E985283d01C702B62224a05f";
const jEUR = "0x23b8683Ff98F9E4781552DFE6f12Aa32814924e8";
const jGBP = "0x048E9b1ddF9EBbb224812372280e94Ccac443f9e";
const jMXN = "0x47b19Af93d0bC33805269Af02B5CA953Aa145127";
const BRZ = "0x71be881e9C5d4465B3FfF61e89c6f3651E69B5bb";
const BRZw = "0x5b1a9850f55d9282a7C4Bf23A2a21B050e3Beb2f";
const BTCB_BOMB = "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6";
const WBNB_BUSD = "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16";
const WBNB_DAI = "0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3";
const WBNB_USDC = "0xd99c7F6C65857AC913a8f880A4cb84032AB2FC5b";
const WBNB_USDT = "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE";
const WBNB_ETH = "0x74E4716E431f45807DCF19f284c7aA99F18a4fbc";
const BUSD_USDT = "0x7EFaEf62fDdCCa950418312c6C91Aef321375A00";
const BUSD_BTCB = "0xF45cd219aEF8618A92BAa7aD848364a158a24F33";
const USDC_BUSD = "0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1";
const USDC_ETH = "0xEa26B78255Df2bBC31C1eBf60010D78670185bD0";
const CAKE_WBNB = "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0";
const BTCB_ETH = "0xD171B26E4484402de70e3Ea256bE5A2630d7e88D";
const ANKR_ankrBNB = "0x8028AC1195B6469de22929C4f329f96B06d65F25";
const EPX = "0xAf41054C1487b0e5E2B9250C0332eCBCe6CE9d71";
const DDD = "0x84c97300a190676a19D1E13115629A11f8482Bd1";
const pSTAKE = "0x4C882ec256823eE773B25b414d36F92ef58a7c0C";
const SD = "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8";
const ANKR = "0xf307910A4c7bbc79691fD374889b36d8531B08e3";
const WOMBATLP_WBNB = "0x74f019A5C4eD2C2950Ce16FaD7Af838549092c5b";
const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
// solidly
const solidlyStableAMM_jBRL_BRZ = "0xA0695f78AF837F570bcc50f53e58Cda300798B65";
const solidlyVolatileAMM_ANKR_ankrBNB = "0x7ef540f672Cd643B79D2488344944499F7518b1f";

const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.BNB,
    underlying: BNB,
    name: "Binance Network Token",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: defaultDocs("https://bscscan.com", BNB),
    disabled: true,
  },
  {
    symbol: assetSymbols.WBNB,
    underlying: WBNB,
    name: "Wrapped Binance Network Token",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.bsc),
  },
  {
    symbol: assetSymbols.BUSD,
    underlying: BUSD,
    name: "Binance USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", BUSD),
  },
  {
    symbol: assetSymbols.BTCB,
    underlying: BTCB,
    name: "Binance BTC",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", BTCB),
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Binance DAI",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", DAI),
  },
  {
    symbol: assetSymbols.ETH,
    underlying: ETH,
    name: "Binance ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", ETH),
  },
  // CZ
  {
    symbol: assetSymbols.BETH,
    underlying: BETH,
    name: "Binance Beacon ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", BETH),
    disabled: true,
  },
  {
    symbol: assetSymbols.CAKE,
    underlying: CAKE,
    name: "PancakeSwap Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", CAKE),
  },
  //
  {
    symbol: assetSymbols.AUTO,
    underlying: AUTO,
    name: "AUTOv2",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", AUTO),
    disabled: true,
  },
  {
    symbol: assetSymbols.BIFI,
    underlying: BIFI,
    name: "beefy.finance",
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    decimals: 18,
    extraDocs: defaultDocs("https://bscscan.com", BIFI),
    disabled: true,
  },
  {
    symbol: assetSymbols.ALPACA,
    underlying: ALPACA,
    name: "AlpacaToken",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", ALPACA),
    disabled: true,
  },
  // stables
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "Binance-Peg USD Coin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", USDC),
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Binance-Peg BSC-USD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", USDT),
  },
  {
    symbol: assetSymbols.TUSD,
    underlying: TUSD,
    name: "Wrapped TrueUSD",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", TUSD),
    disabled: true,
  },
  {
    symbol: assetSymbols.MAI,
    underlying: MAI,
    name: "Mai Stablecoin",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: defaultDocs("https://bscscan.com", MAI),
  },
  {
    symbol: assetSymbols.HAY,
    underlying: HAY,
    name: "HAY",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", HAY),
  },
  // Ellipsis
  {
    symbol: assetSymbols["3EPS"],
    underlying: threeEPS,
    name: "Ellipsis.finance 3EPS (BUSD/USDC/USDT)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0x160CAed03795365F3A589f10C379FfA7d75d4E76", "3EPS", threeEPS),
  },
  {
    symbol: assetSymbols.mai3EPS,
    underlying: maiThreeEPS,
    name: "Ellipsis.finance MAI 3EPS (MAI/BUSD/USDC/USDT)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0x68354c6E8Bbd020F9dE81EAf57ea5424ba9ef322", "mai3EPS", maiThreeEPS),
  },
  {
    symbol: assetSymbols.val3EPS,
    underlying: val3EPS,
    name: "Ellipsis.finance val3EPS (BUSD/USDC/USDT)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d", "val3EPS", val3EPS),
  },
  {
    symbol: assetSymbols.valdai3EPS,
    underlying: valdai3EPS,
    name: "Ellipsis.finance valdai3EPS (DAI, val3EPS)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0x245e8bb5427822FB8fd6cE062d8dd853FbcfABF5", "valdai3EPS", valdai3EPS),
  },
  {
    symbol: assetSymbols["2brl"],
    underlying: twoBRL,
    name: "Ellipsis.finance 2BRL (BRZ, jBRL)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3", "2brl", twoBRL),
  },
  {
    symbol: assetSymbols["3brl"],
    underlying: threeBRL,
    name: "Ellipsis.finance 3BRL (jBRL, BRZ, BRZ (Wormhole))",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0x43719DfFf12B04C71F7A589cdc7F54a01da07D7a", "3brl", threeBRL),
  },
  {
    symbol: assetSymbols["JCHF-BUSD"],
    underlying: epsBUSD_jCHF,
    name: "Ellipsis.finance JCHF-BUSD",
    decimals: 18,
    oracle: OracleTypes.CurveV2LpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0xBcA6E25937B0F7E0FD8130076b6B218F595E32e2", "eps BUSD jCHF", epsBUSD_jCHF),
  },
  // Bomb
  {
    symbol: assetSymbols.BOMB,
    underlying: BOMB,
    name: "BOMB",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", BOMB),
    disabled: true,
  },
  {
    symbol: assetSymbols.xBOMB,
    underlying: xBOMB,
    name: "xBOMB",
    decimals: 18,
    disabled: true,
  },
  {
    symbol: assetSymbols.ankrBNB,
    underlying: ankrBNB,
    name: "Ankr Staked BNB ",
    decimals: 18,
    oracle: OracleTypes.AnkrCertificateTokenPriceOracle,
    extraDocs: ankrCertificateDocs("ankrBNB", "BNB"),
  },
  {
    symbol: assetSymbols.stkBNB,
    underlying: stkBNB,
    name: "Staked BNB (Persistance)",
    decimals: 18,
    oracle: OracleTypes.StkBNBPriceOracle,
    extraDocs: stkBNBDocs(),
  },
  {
    symbol: assetSymbols.BNBx,
    underlying: BNBx,
    name: "Liquid Staked BNB (Stader)",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: StaderXDocs("bnbchain", "BNBx"),
  },
  {
    symbol: assetSymbols["epsBNBx-BNB"],
    underlying: epsBNBx_BNB,
    name: "Ellipsis.finance epsBNBx (BNBx/BNB)",
    decimals: 18,
    oracle: OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    extraDocs: ellipsisDocs("0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA", "BNBx/BNB", epsBNBx_BNB),
  },
  {
    symbol: assetSymbols["asBNBx-WBNB"],
    underlying: asBNBx_WBNB,
    name: "BNBx-BNB ApeSwap LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: apeSwapDocs(WBNB, BNBx, "BNBx-WBNB", asBNBx_WBNB),
  },
  {
    symbol: assetSymbols["BTCB-BOMB"],
    underlying: BTCB_BOMB,
    name: "BOMB-BTC PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(BTCB, BOMB, "BOMB-BTC", BTCB_BOMB),
  },
  {
    symbol: assetSymbols["stkBNB-WBNB"],
    underlying: stkBNB_WBNB,
    name: "stkBNB-WBNB PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, stkBNB, "stkBNB-WBNB", stkBNB_WBNB),
  },
  {
    symbol: assetSymbols["ANKR-ankrBNB"],
    underlying: ANKR_ankrBNB,
    name: "ANKR-ankrBNB PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(ANKR, ankrBNB, "ANKR-ankrBNB", ANKR_ankrBNB),
  },
  {
    symbol: assetSymbols["asANKR-ankrBNB"],
    underlying: asANKR_ankrBNB,
    name: "ANKR-ankrBNB ApeSwap LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: apeSwapDocs(ANKR, ankrBNB, "ANKR-ankrBNB", asANKR_ankrBNB),
  },
  // Jarvis
  {
    symbol: assetSymbols.jBRL,
    underlying: jBRL,
    name: "Jarvis Synthetic Brazilian Real",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v1"),
  },
  {
    symbol: assetSymbols.JCHF,
    underlying: jCHF,
    name: "Jarvis Synthetic Swiss Franc",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v1"),
  },
  {
    symbol: assetSymbols.JEUR,
    underlying: jEUR,
    name: "Jarvis Synthetic Euro",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v1"),
  },
  {
    symbol: assetSymbols.JGBP,
    underlying: jGBP,
    name: "Jarvis Synthetic British Pound",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v1"),
  },
  {
    symbol: assetSymbols.JMXN,
    underlying: jMXN,
    name: "Jarvis Synthetic Mexican Peso",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: jarvisDocs("v1"),
  },
  {
    symbol: assetSymbols.BRZ,
    underlying: BRZ,
    name: "BRZ Token",
    decimals: 4,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>You can acquire BRZ tokens at <a href="https://www.brztoken.io" target="_blank" style="color: #BCAC83; cursor="pointer">https://www.brztoken.io</> or other centralised exchanges</p>`,
  },
  {
    symbol: assetSymbols.BRZw,
    underlying: BRZw,
    name: "BRZ Token (Wormhole)",
    decimals: 4,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `<p><b>How to acquire this token</b><p/><br />
    <p>This is the Wormhole-bridged version of BRZ. To get it, you can bridge BRZ from Solana to BSC using the <a href="https://www.portalbridge.com/#/transfer" target="_blank" style="color: #BCAC83; cursor="pointer">Official Bridge</></p>`,
  },
  {
    symbol: assetSymbols["WBNB-BUSD"],
    underlying: WBNB_BUSD,
    name: "WBNB-BUSD PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, BUSD, "WBNB-BUSD", WBNB_BUSD),
  },
  {
    symbol: assetSymbols["WBNB-DAI"],
    underlying: WBNB_DAI,
    name: "WBNB-DAI PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, DAI, "WBNB-DAI", WBNB_DAI),
  },
  {
    symbol: assetSymbols["WBNB-USDC"],
    underlying: WBNB_USDC,
    name: "WBNB-USDC PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, USDC, "WBNB-USDC", WBNB_USDC),
  },
  {
    symbol: assetSymbols["WBNB-USDT"],
    underlying: WBNB_USDT,
    name: "WBNB-USDT PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, USDT, "WBNB-USDT", WBNB_USDT),
  },
  {
    symbol: assetSymbols["WBNB-ETH"],
    underlying: WBNB_ETH,
    name: "WBNB-ETH PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(WBNB, ETH, "WBNB-ETH", WBNB_ETH),
  },
  {
    symbol: assetSymbols["BUSD-USDT"],
    underlying: BUSD_USDT,
    name: "BUSD-USDT PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(BUSD, USDT, "BUSD-USDT", BUSD_USDT),
  },
  {
    symbol: assetSymbols["BUSD-BTCB"],
    underlying: BUSD_BTCB,
    name: "BUSD-BTCB PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(BUSD, BTCB, "BUSD-BTCB", BUSD_BTCB),
  },
  {
    symbol: assetSymbols["USDC-BUSD"],
    underlying: USDC_BUSD,
    name: "USDC-BUSD PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(USDC, BUSD, "USDC-BUSD", USDC_BUSD),
  },
  {
    symbol: assetSymbols["USDC-ETH"],
    underlying: USDC_ETH,
    name: "USDC-ETH PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(USDC, ETH, "USDC-ETH", USDC_ETH),
  },
  {
    symbol: assetSymbols["CAKE-WBNB"],
    underlying: CAKE_WBNB,
    name: "CAKE-WBNB PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(CAKE, WBNB, "CAKE-WBNB", CAKE_WBNB),
  },
  {
    symbol: assetSymbols["BTCB-ETH"],
    underlying: BTCB_ETH,
    name: "BTCB-ETH PCS LP",
    decimals: 18,
    oracle: OracleTypes.UniswapLpTokenPriceOracle,
    extraDocs: pancakeSwapDocs(BTCB, ETH, "BTCB-ETH", BTCB_ETH),
  },
  {
    symbol: assetSymbols.EPX,
    underlying: EPX,
    name: "Ellipsis X",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", EPX),
    disabled: true,
  },
  {
    symbol: assetSymbols.DDD,
    underlying: DDD,
    name: "DotDot",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", DDD),
    disabled: true,
  },
  {
    symbol: assetSymbols.pSTAKE,
    underlying: pSTAKE,
    name: "pSTAKE",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", pSTAKE),
    disabled: true,
  },
  {
    symbol: assetSymbols.SD,
    underlying: SD,
    name: "SD",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", SD),
    disabled: true,
  },
  {
    symbol: assetSymbols.ANKR,
    underlying: ANKR,
    name: "Ankr",
    decimals: 18,
    oracle: OracleTypes.UniswapTwapPriceOracleV2,
    extraDocs: defaultDocs("https://bscscan.com", ANKR),
    disabled: true,
  },
  {
    symbol: assetSymbols["WOMBATLP-WBNB"],
    underlying: WOMBATLP_WBNB,
    name: "WombatLp WBNB",
    decimals: 18,
    oracle: OracleTypes.WombatLpTokenPriceOracle,
    extraDocs: wombatDocs("BNB", "WBNB"),
  },
  // Thena
  {
    symbol: assetSymbols["sAMM-jBRL/BRZ"],
    underlying: solidlyStableAMM_jBRL_BRZ,
    name: "Stable V1 AMM - jBRL/BRZ",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: thenaDocs(solidlyStableAMM_jBRL_BRZ),
  },
  {
    symbol: assetSymbols["vAMM-ANKR/ankrBNB"],
    underlying: solidlyVolatileAMM_ANKR_ankrBNB,
    name: "Volatile V1 AMM - ANKR/ankrBNB",
    decimals: 18,
    oracle: OracleTypes.SolidlyLpTokenPriceOracle,
    extraDocs: thenaDocs(solidlyVolatileAMM_ANKR_ankrBNB),
  },
];

export default assets;

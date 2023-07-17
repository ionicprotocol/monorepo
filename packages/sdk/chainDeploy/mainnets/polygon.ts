import { polygon } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { AddressesProvider } from "../../typechain/AddressesProvider";
import {
  ChainDeployConfig,
  ChainlinkFeedBaseCurrency,
  configureBalancerSwap,
  deployAlgebraPriceOracle,
  deployAnkrCertificateTokenPriceOracle,
  deployBalancerLinearPoolPriceOracle,
  deployBalancerLpPriceOracle,
  deployBalancerRateProviderPriceOracle,
  deployBalancerStableLpPriceOracle,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployDiaOracle,
  deployGelatoGUniPriceOracle,
  deploySolidlyPriceOracle,
  deployUniswapLpOracle,
  deployUniswapV3Oracle
} from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import {
  BalancerLinearPoolAsset,
  BalancerLpAsset,
  BalancerRateProviderAsset,
  BalancerStableLpAsset,
  BalancerSwapTokenLiquidatorData,
  ChainDeployFnParams,
  ChainlinkAsset,
  ConcentratedLiquidityOracleConfig,
  CurvePoolConfig,
  DiaAsset,
  GelatoGUniAsset,
  SolidlyOracleAssetConfig
} from "../helpers/types";

const assets = polygon.assets;
const wmatic = underlying(assets, assetSymbols.WMATIC);

export const deployConfig: ChainDeployConfig = {
  wtoken: wmatic,
  nativeTokenUsdChainlinkFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  nativeTokenName: "Matic Token",
  nativeTokenSymbol: "MATIC",
  stableToken: underlying(assets, assetSymbols.USDC),
  wBTCToken: underlying(assets, assetSymbols.WBTC),
  blocksPerYear: polygon.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [
      {
        lpDisplayName: "Uniswap",
        lpName: "Uniswap LPs",
        lpSymbol: "UNI-LP"
      },
      {
        lpDisplayName: "SushiSwap",
        lpName: "SushiSwap LPs",
        lpSymbol: "SUSHI-LP"
      },
      {
        lpDisplayName: "QuickSwap",
        lpName: "QuickSwap LPs",
        lpSymbol: "QUICK-LP"
      }
    ],

    // quickswap
    pairInitHashCode: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    uniswapV2RouterAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    uniswapV2FactoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    uniswapV3FactoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    uniswapOracleInitialDeployTokens: [],
    uniswapOracleLpTokens: [
      underlying(assets, assetSymbols["WMATIC-USDC"]),
      underlying(assets, assetSymbols["WMATIC-ETH"]),
      underlying(assets, assetSymbols["WMATIC-USDT"]),
      underlying(assets, assetSymbols["WETH-WBTC"]),
      underlying(assets, assetSymbols["MAI-USDC"]),
      underlying(assets, assetSymbols["WMATIC-MATICx"]),
      underlying(assets, assetSymbols["DAI-GNS"]),
      underlying(assets, assetSymbols["IXT-USDT"])
    ],
    flashSwapFee: 30
  },
  dynamicFlywheels: [
    {
      rewardToken: "0xADAC33f543267c4D59a8c299cF804c303BC3e4aC",
      cycleLength: 1,
      name: "MIMO"
    }
  ],
  cgId: polygon.specificParams.cgId
};

const uniswapV3OracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.GNS),
    poolAddress: "0xEFa98Fdf168f372E5e9e9b910FcDfd65856f3986",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.WMATIC)
  },
  {
    assetAddress: underlying(assets, assetSymbols.TNGBL),
    poolAddress: "0xDC8a5c5975726235402cFac9B28268EEccd42813",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.DAI)
  }
];

const algebraOracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.IXT),
    poolAddress: "0xD6e486c197606559946384AE2624367d750A160f",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.USDT)
  },
  {
    assetAddress: underlying(assets, assetSymbols.SD),
    poolAddress: "0x5D0aCfa39A0FCA603147f1c14e53f46BE76984BC",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.USDC)
  }
];

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.AAVE,
    aggregator: "0x72484B12719E23115761D5DA1646945632979bB6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.ALCX,
    aggregator: "0x5DB6e61B6159B20F068dc15A47dF2E5931b14f29",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BAL,
    aggregator: "0xD106B538F2A868c28Ca1Ec7E298C3325E0251d66",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.oBNB,
    aggregator: "0x82a6c4AF830caa6c97bb504425f6A66165C2c26e",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BUSD,
    aggregator: "0xE0dC07D5ED74741CeeDA61284eE56a2A0f7A4Cc9",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.CRV,
    aggregator: "0x336584C8E6Dc19637A5b36206B1c79923111b405",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.CVX,
    aggregator: "0x5ec151834040B4D453A1eA46aA634C1773b36084",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.WETH,
    aggregator: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x00DBeB1e45485d53DF7C2F0dF1Aa0b6Dc30311d3",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FTM,
    aggregator: "0x58326c0F831b2Dbf7234A4204F28Bba79AA06d5f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FXS,
    aggregator: "0x6C0fe985D3cAcbCdE428b84fc9431792694d0f51",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.GHST,
    aggregator: "0xDD229Ce42f11D8Ee7fFf29bDB71C7b81352e11be",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.GRT,
    aggregator: "0x3FabBfb300B1e2D7c9B84512fe9D30aeDF24C410",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.LINK,
    aggregator: "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.MAI,
    aggregator: "0xd8d483d813547CfB624b8Dc33a00F2fcbCd2D428",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.MATICx,
    aggregator: "0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.MKR,
    aggregator: "0xa070427bF5bA5709f70e98b94Cb2F435a242C46C",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.RAI,
    aggregator: "0x7f45273fD7C644714825345670414Ea649b50b16",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SNX,
    aggregator: "0xbF90A5D9B6EE9019028dbFc2a9E50056d5252894",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SOL,
    aggregator: "0x10C8264C0935b3B9870013e057f330Ff3e9C56dC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.stMATIC,
    aggregator: "0x97371dF4492605486e23Da797fA68e55Fc38a13f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SUSHI,
    aggregator: "0x49B0c695039243BBfEb8EcD054EB70061fd54aa0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.YFI,
    aggregator: "0x9d3A43c111E7b2C6601705D9fcF7a70c95b1dc55",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.AGEUR,
    aggregator: "0x9b88d07B2354eF5f4579690356818e07371c7BeD",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JEUR,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.EURT,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.EURE,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JJPY,
    aggregator: "0xD647a6fC9BC6402301583C91decC5989d8Bc382D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JPYC,
    aggregator: "0xD647a6fC9BC6402301583C91decC5989d8Bc382D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JCAD,
    aggregator: "0xACA44ABb8B04D07D883202F99FA5E3c53ed57Fb5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.CADC,
    aggregator: "0xACA44ABb8B04D07D883202F99FA5E3c53ed57Fb5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JSGD,
    aggregator: "0x8CE3cAc0E6635ce04783709ca3CC4F5fc5304299",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.XSGD,
    aggregator: "0x8CE3cAc0E6635ce04783709ca3CC4F5fc5304299",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JNZD,
    aggregator: "0xa302a0B8a499fD0f00449df0a490DedE21105955",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.NZDS,
    aggregator: "0xa302a0B8a499fD0f00449df0a490DedE21105955",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JCHF,
    aggregator: "0xc76f762CedF0F78a439727861628E0fdfE1e70c2",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JMXN,
    aggregator: "0x171b16562EA3476F5C61d1b8dad031DbA0768545",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JGBP,
    aggregator: "0x099a2540848573e94fb1Ca0Fa420b00acbBc845a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JCNY,
    aggregator: "0x04bB437Aa63E098236FA47365f0268547f6EAB32",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JAUD,
    aggregator: "0x062Df9C4efd2030e243ffCc398b652e8b8F95C6f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JPLN,
    aggregator: "0xB34BCE11040702f71c11529D00179B2959BcE6C0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JSEK,
    aggregator: "0xbd92B4919ae82be8473859295dEF0e778A626302",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JKRW,
    aggregator: "0x24B820870F726dA9B0D83B0B28a93885061dbF50",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JPHP,
    aggregator: "0x218231089Bebb2A31970c3b77E96eCfb3BA006D1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.jBRL,
    aggregator: "0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BRZ,
    aggregator: "0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  }
];

// https://polygon.curve.fi/
const curvePools: CurvePoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols["AGEUR-JEUR"]),
    pool: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
    underlyings: [underlying(assets, assetSymbols.AGEUR), underlying(assets, assetSymbols.JEUR)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JEUR-PAR"]),
    pool: "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
    underlyings: [underlying(assets, assetSymbols.PAR), underlying(assets, assetSymbols.JEUR)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JEUR-EURT"]),
    pool: "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1",
    underlyings: [underlying(assets, assetSymbols.JEUR), underlying(assets, assetSymbols.EURT)]
  },
  {
    lpToken: underlying(assets, assetSymbols["EURE-JEUR"]),
    pool: "0x2F3E9CA3bFf85B91D9fe6a9f3e8F9B1A6a4c3cF4",
    underlyings: [underlying(assets, assetSymbols.JEUR), underlying(assets, assetSymbols.EURE)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JJPY-JPYC"]),
    pool: "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc",
    underlyings: [underlying(assets, assetSymbols.JJPY), underlying(assets, assetSymbols.JPYC)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JCAD-CADC"]),
    pool: "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
    underlyings: [underlying(assets, assetSymbols.JCAD), underlying(assets, assetSymbols.CADC)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JSGD-XSGD"]),
    pool: "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
    underlyings: [underlying(assets, assetSymbols.JSGD), underlying(assets, assetSymbols.XSGD)]
  },
  {
    lpToken: underlying(assets, assetSymbols["JNZD-NZDS"]),
    pool: "0x976A750168801F58E8AEdbCfF9328138D544cc09",
    underlyings: [underlying(assets, assetSymbols.JNZD), underlying(assets, assetSymbols.NZDS)]
  },
  {
    lpToken: underlying(assets, assetSymbols.am3CRV),
    pool: "0x445FE580eF8d70FF569aB36e80c647af338db351",
    underlyings: [
      underlying(assets, assetSymbols.DAI),
      underlying(assets, assetSymbols.USDC),
      underlying(assets, assetSymbols.USDT)
    ]
  },
  {
    lpToken: underlying(assets, assetSymbols.USDR3CRV),
    pool: "0xa138341185a9D0429B0021A11FB717B225e13e1F",
    underlyings: [
      underlying(assets, assetSymbols.USDR),
      underlying(assets, assetSymbols.DAI),
      underlying(assets, assetSymbols.USDC),
      underlying(assets, assetSymbols.USDT)
    ]
  }
];

const gelatoAssets: GelatoGUniAsset[] = [
  {
    // USDC/WETH
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_WETH_005)
  },
  {
    // WBTC/WETH
    vaultAddress: underlying(assets, assetSymbols.arrakis_WBTC_WETH_005)
  },
  {
    // USDC/PAR
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_PAR_005)
  },
  {
    // WMATIC/USDC
    vaultAddress: underlying(assets, assetSymbols.arrakis_WMATIC_USDC_005)
  },
  {
    // USDC/agEUR
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_agEUR_001)
  },
  {
    // WMATIC/WETH
    vaultAddress: underlying(assets, assetSymbols.arrakis_WMATIC_WETH_005)
  },
  {
    // WMATIC/AAVE
    vaultAddress: underlying(assets, assetSymbols.arrakis_WMATIC_AAVE_03)
  },
  {
    // USDC/MAI
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_MAI_005)
  },
  {
    // USDC/USDT 0.01 % fee tier
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_USDT_001)
  },
  {
    // USDC/USDT 0.05 % fee tier
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_USDT_005)
  },
  {
    // USDC/DAI
    vaultAddress: underlying(assets, assetSymbols.arrakis_USDC_DAI_005)
  },
  {
    // WETH/DAI
    vaultAddress: underlying(assets, assetSymbols.arrakis_WETH_DAI_03)
  }
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.MIMO,
    underlying: underlying(assets, assetSymbols.MIMO),
    feed: "0xd3709072C338689F94a4072a26Bb993559D9a026",
    key: "MIMO/USD"
  },
  {
    symbol: assetSymbols.PAR,
    underlying: underlying(assets, assetSymbols.PAR),
    feed: "0xd3709072C338689F94a4072a26Bb993559D9a026",
    key: "PAR/USD"
  }
  // {
  //   symbol: assetSymbols.USDR,
  //   underlying: underlying(assets, assetSymbols.USDR),
  //   feed: "0x763F20F3Fcdd30e11EF633A70B4396B91C149189",
  //   key: "USDR/USD",
  // },
];

const balancerLpAssets: BalancerLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.MIMO_PAR_80_20)
  }
];

const balancerStableLpAssets: BalancerStableLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.BRZ_JBRL_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WMATIC_STMATIC_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WMATIC_CSMATIC_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.TETU_BOOSTED_STABLE_BLP)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.MaticX_bbaWMATIC)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.StMatic_bbaWMATIC)
  }
];

const balancerLinerPoolAssets: BalancerLinearPoolAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.TETU_LINEAR_USDT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.TETU_LINEAR_USDC)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.TETU_LINEAR_DAI)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)
  }
];

const balancerRateProviderAssets: BalancerRateProviderAsset[] = [
  {
    tokenAddress: underlying(assets, assetSymbols.csMATIC),
    baseToken: underlying(assets, assetSymbols.WMATIC),
    rateProviderAddress: "0x87393BE8ac323F2E63520A6184e5A8A9CC9fC051"
  }
];

const solidlyOracleSupportedStables: string[] = [
  deployConfig.stableToken!,
  underlying(assets, assetSymbols.USDC),
  underlying(assets, assetSymbols.USDR)
];

const solidlyOracles: SolidlyOracleAssetConfig[] = [
  {
    underlying: underlying(assets, assetSymbols.USDR),
    poolAddress: "0xf6A72Bd46F53Cd5103812ea1f4B5CF38099aB797", // sAMM-USDC-USDR
    baseToken: underlying(assets, assetSymbols.USDC)
  },
  {
    underlying: underlying(assets, assetSymbols.WUSDR),
    poolAddress: "0x10E1b58B3C93890D04D539b5f39Aa4Df27A362b2", // vAMM-wUSDR-USDR
    baseToken: underlying(assets, assetSymbols.USDR)
  }
];

const balancerSwapLiquidatorData: BalancerSwapTokenLiquidatorData[] = [
  {
    inputToken: underlying(assets, assetSymbols.TETU_LINEAR_USDC),
    outputToken: underlying(assets, assetSymbols.USDC),
    poolAddress: underlying(assets, assetSymbols.TETU_LINEAR_USDC)
  },
  {
    inputToken: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC),
    outputToken: underlying(assets, assetSymbols.WMATIC),
    poolAddress: underlying(assets, assetSymbols.AAVE_LINEAR_WMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.MATICx),
    outputToken: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
    poolAddress: underlying(assets, assetSymbols.MaticX_bbaWMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
    outputToken: underlying(assets, assetSymbols.MATICx),
    poolAddress: underlying(assets, assetSymbols.MaticX_bbaWMATIC)
  },
  {
    inputToken: underlying(assets, assetSymbols.PAR),
    outputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    poolAddress: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    outputToken: underlying(assets, assetSymbols.PAR),
    poolAddress: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.MATICx),
    outputToken: underlying(assets, assetSymbols.WMATIC),
    poolAddress: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC),
    outputToken: underlying(assets, assetSymbols.MATICx),
    poolAddress: underlying(assets, assetSymbols.WMATIC_MATICX_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.stMATIC),
    outputToken: underlying(assets, assetSymbols.WMATIC),
    poolAddress: underlying(assets, assetSymbols.WMATIC_STMATIC_STABLE_BLP)
  },
  {
    inputToken: underlying(assets, assetSymbols.WMATIC),
    outputToken: underlying(assets, assetSymbols.stMATIC),
    poolAddress: underlying(assets, assetSymbols.WMATIC_STMATIC_STABLE_BLP)
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES

  //// Solidly Price Oracle
  await deploySolidlyPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    supportedBaseTokens: solidlyOracleSupportedStables,
    assets: solidlyOracles
  });

  //// deploy uniswap v3 price oracle
  await deployUniswapV3Oracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    concentratedLiquidityOracleTokens: uniswapV3OracleTokens
  });

  //// deploy algebra price oracle
  await deployAlgebraPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    concentratedLiquidityOracleTokens: algebraOracleTokens
  });

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets
  });
  ////

  //// Uniswap Oracle
  // await deployUniswapOracle({
  //   run,
  //   ethers,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  // });

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig
  });

  //// Curve LP Oracle
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools
  });

  //// Gelato GUni Oracle
  await deployGelatoGUniPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    gelatoAssets
  });

  /// Dia Price Oracle
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: ethers.constants.AddressZero, key: "" }
  });

  /// Balancer LP Price Oracle
  await deployBalancerLpPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLpAssets
  });

  /// Balancer LP Price Oracle
  await deployBalancerRateProviderPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerRateProviderAssets
  });
  /// Balancer Stable LP Price Oracle
  await deployBalancerLinearPoolPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLinerPoolAssets
  });

  /// Balancer Stable LP Price Oracle
  await deployBalancerStableLpPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLpAssets: balancerStableLpAssets
  });

  /// Ankr Certificate Price Oracle
  await deployAnkrCertificateTokenPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
    certificateAssetSymbol: assetSymbols.aMATICc
  });

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig
  });
  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);

  // Quoter
  const quoter = await deployments.deploy("Quoter", {
    from: deployer,
    args: [deployConfig.uniswap.uniswapV3FactoryAddress],
    log: true,
    waitConfirmations: 1
  });
  console.log("Quoter: ", quoter.address);

  //// Liquidator Redemption Strategies

  //// UniswapLpTokenLiquidator
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (uniswapLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapLpTokenLiquidator.transactionHash);
  }
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  //// Balancer Lp token liquidator
  const balancerLpTokenLiquidator = await deployments.deploy("BalancerLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (balancerLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(balancerLpTokenLiquidator.transactionHash);
  console.log("BalancerLpTokenLiquidator: ", balancerLpTokenLiquidator.address);

  //// Balancer Swap token liquidator
  const balancerSwapTokenLiquidator = await deployments.deploy("BalancerSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (balancerSwapTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(balancerSwapTokenLiquidator.transactionHash);
  console.log("BalancerSwapLiquidator: ", balancerSwapTokenLiquidator.address);

  const algebraSwapLiquidator = await deployments.deploy("AlgebraSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (algebraSwapLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(algebraSwapLiquidator.transactionHash);
  }
  console.log("AlgebraSwapLiquidator: ", algebraSwapLiquidator.address);

  //// CurveLPLiquidator
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  // CurveSwapLiquidator
  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (curveSwapLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(curveSwapLiquidator.transactionHash);
  console.log("CurveSwapLiquidator: ", curveSwapLiquidator.address);

  // CurveLpTokenWrapper
  const curveLpTokenWrapper = await deployments.deploy("CurveLpTokenWrapper", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (curveLpTokenWrapper.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenWrapper.transactionHash);
  console.log("CurveLpTokenWrapper: ", curveLpTokenWrapper.address);

  // Gamma LP token liquidator
  const gammaLpTokenLiquidator = await deployments.deploy("GammaLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true
  });
  if (gammaLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(gammaLpTokenLiquidator.transactionHash);
  console.log("GammaLpTokenLiquidator: ", gammaLpTokenLiquidator.address);

  //// Gelato GUNI Liquidator
  const gelatoGUniLiquidator = await deployments.deploy("GelatoGUniLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (gelatoGUniLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(gelatoGUniLiquidator.transactionHash);
  }
  console.log("GelatoGUniLiquidator: ", gelatoGUniLiquidator.address);

  //// Aave AToken Liquidator
  const aaveTokenLiquidator = await deployments.deploy("AaveTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (aaveTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(aaveTokenLiquidator.transactionHash);
  }
  console.log("AaveTokenLiquidator: ", aaveTokenLiquidator.address);

  // curve swap liquidator funder - TODO replace the CurveSwapLiquidator above
  const curveSwapLiquidatorFunder = await deployments.deploy("CurveSwapLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (curveSwapLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(curveSwapLiquidatorFunder.transactionHash);
  console.log("CurveSwapLiquidatorFunder: ", curveSwapLiquidatorFunder.address);

  //// JarvisLiquidatorFunder
  const jarvisLiquidatorFunder = await deployments.deploy("JarvisLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (jarvisLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(jarvisLiquidatorFunder.transactionHash);
  console.log("JarvisLiquidatorFunder: ", jarvisLiquidatorFunder.address);

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

  //// custom uniswap v2 redemptions and funding
  const uniswapV2LiquidatorFunder = await deployments.deploy("UniswapV2LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (uniswapV2LiquidatorFunder.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapV2LiquidatorFunder.transactionHash);
  }
  console.log("UniswapV2LiquidatorFunder: ", uniswapV2LiquidatorFunder.address);

  // Solidly Liquidators
  const solidlyLpTokenLiquidator = await deployments.deploy("SolidlyLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (solidlyLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(solidlyLpTokenLiquidator.transactionHash);
  console.log("SolidlyLpTokenLiquidator: ", solidlyLpTokenLiquidator.address);

  const solidlyLpTokenWrapper = await deployments.deploy("SolidlyLpTokenWrapper", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (solidlyLpTokenWrapper.transactionHash)
    await ethers.provider.waitForTransaction(solidlyLpTokenWrapper.transactionHash);
  console.log("SolidlyLpTokenWrapper: ", solidlyLpTokenWrapper.address);

  const solidlySwapLiquidator = await deployments.deploy("SolidlySwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (solidlySwapLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(solidlySwapLiquidator.transactionHash);
  console.log("SolidlySwapLiquidator: ", solidlySwapLiquidator.address);

  /// Addresses Provider
  /// set bUSD
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const busdAddress = underlying(assets, assetSymbols.BUSD);
  const busdAddressAp = await addressesProvider.callStatic.getAddress("bUSD");
  if (busdAddressAp !== busdAddress) {
    const tx = await addressesProvider.setAddress("bUSD", busdAddress);
    await tx.wait();
    console.log("setAddress bUSD: ", tx.hash);
  }
  /// set BalancerLpStablePoolPriceOracle
  const balancerLpStablePoolPriceOracle = await ethers.getContractOrNull("BalancerLpStablePoolPriceOracle", deployer);
  const balancerLpStablePoolPriceOracleAp = await addressesProvider.callStatic.getAddress(
    "BalancerLpStablePoolPriceOracle"
  );
  if (
    balancerLpStablePoolPriceOracle &&
    balancerLpStablePoolPriceOracleAp !== balancerLpStablePoolPriceOracle.address
  ) {
    const tx = await addressesProvider.setAddress(
      "BalancerLpStablePoolPriceOracle",
      balancerLpStablePoolPriceOracle.address
    );
    console.log("setAddress BalancerLpStablePoolPriceOracle: ", tx.hash);
    await tx.wait();
    console.log("mined setAddress BalancerLpStablePoolPriceOracle: ", tx.hash);
  }
  await configureBalancerSwap(addressesProvider, balancerSwapLiquidatorData);
};

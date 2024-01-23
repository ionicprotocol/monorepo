import { bsc } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { AddressesProvider } from "../../typechain/AddressesProvider";
import {
  ChainDeployConfig,
  ChainlinkFeedBaseCurrency,
  deployAlgebraPriceOracle,
  deployAnkrCertificateTokenPriceOracle,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployCurveV2LpOracle,
  deployFlywheelWithDynamicRewards,
  deployGammaPoolOracle,
  deploySolidlyLpOracle,
  deploySolidlyPriceOracle,
  deployStkBNBOracle,
  deployUniswapLpOracle,
  deployUniswapOracle,
  deployWombatOracle
} from "../helpers";
import {
  ChainDeployFnParams,
  ChainlinkAsset,
  ConcentratedLiquidityOracleConfig,
  CurvePoolConfig,
  CurveV2PoolConfig,
  GammaLpAsset,
  GammaUnderlyingSwap,
  SolidlyLpAsset,
  SolidlyOracleAssetConfig,
  WombatAsset
} from "../helpers/types";

const assets = bsc.assets;
const wbnb = underlying(assets, assetSymbols.WBNB);

export const deployConfig: ChainDeployConfig = {
  wtoken: wbnb,
  nativeTokenUsdChainlinkFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  nativeTokenName: "Binance Network Token",
  nativeTokenSymbol: "BNB",
  stableToken: underlying(assets, assetSymbols.BUSD),
  wBTCToken: underlying(assets, assetSymbols.BTCB),
  blocksPerYear: bsc.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [
      {
        lpDisplayName: "PancakeSwap",
        lpName: "Pancake LPs",
        lpSymbol: "Cake-LP"
      }
    ],
    pairInitHashCode: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    uniswapV2RouterAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    uniswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    uniswapOracleInitialDeployTokens: [
      {
        token: underlying(assets, assetSymbols.DDD),
        pair: "0xc19956eCA8A3333671490EF6D6d4329Df049dddD", // WBNB-DDD
        baseToken: wbnb,
        minPeriod: 1800,
        deviationThreshold: "50000000000000000" // 5%
      },
      {
        token: underlying(assets, assetSymbols.EPX),
        pair: "0x30B8A03ba1269cC2daf1Be481bca699DC98D8726", // WBNB-EPX
        baseToken: wbnb,
        minPeriod: 1800,
        deviationThreshold: "50000000000000000" // 5%
      }
    ],
    uniswapOracleLpTokens: [
      underlying(assets, assetSymbols["WBNB-BUSD"]), // WBNB-BUSD PCS LP
      underlying(assets, assetSymbols["WBNB-DAI"]), // WBNB-DAI PCS LP
      underlying(assets, assetSymbols["WBNB-USDC"]), // WBNB-USDC PCS LP
      underlying(assets, assetSymbols["WBNB-USDT"]), // WBNB-USDT PCS LP
      underlying(assets, assetSymbols["USDC-ETH"]), // USDC-ETH PCS LP
      underlying(assets, assetSymbols["BUSD-BTCB"]), // BUSD-BTCB PCS LP
      underlying(assets, assetSymbols["CAKE-WBNB"]), // CAKE-WBNB PCS LP
      underlying(assets, assetSymbols["BTCB-ETH"]), // BTCB-ETH PCS LP
      underlying(assets, assetSymbols["WBNB-ETH"]), // WBNB-ETH PCS LP
      underlying(assets, assetSymbols["USDC-BUSD"]), // USDC-BUSD PCS LP
      underlying(assets, assetSymbols["BUSD-USDT"]), // BUSD-USDT PCS LP
      underlying(assets, assetSymbols["BTCB-ETH"]), // BTCB-ETH PCS LP
      underlying(assets, assetSymbols["stkBNB-WBNB"]), // stkBNB-WBNB PCS LP
      underlying(assets, assetSymbols["ANKR-ankrBNB"]), // ANKR-ankrBNB PCS LP
      underlying(assets, assetSymbols["asANKR-ankrBNB"]) // ANKR-ankrBNB ApeSwap LP
    ],
    flashSwapFee: 25
  },
  dynamicFlywheels: [
    {
      rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
      cycleLength: 1,
      name: "DDD",
      flywheelToReplace: "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c"
    },
    {
      rewardToken: "0xAf41054C1487b0e5E2B9250C0332eCBCe6CE9d71",
      cycleLength: 1,
      name: "EPX",
      flywheelToReplace: "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4"
    },
    {
      rewardToken: "0xa184088a740c695E156F91f5cC086a06bb78b827",
      cycleLength: 1,
      name: "AUTOv2"
    },
    {
      rewardToken: underlying(assets, assetSymbols.THE),
      cycleLength: 1,
      name: "THE"
    }
  ],
  cgId: bsc.specificParams.cgId
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.BUSD,
    aggregator: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BTCB,
    aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.ETH,
    aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  // CZ
  {
    symbol: assetSymbols.BETH,
    aggregator: "0x2A3796273d47c4eD363b361D3AEFb7F7E2A13782",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.CAKE,
    aggregator: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  //
  {
    symbol: assetSymbols.AUTO,
    aggregator: "0x88E71E6520E5aC75f5338F5F0c9DeD9d4f692cDA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BIFI,
    aggregator: "0xaB827b69daCd586A37E80A7d552a4395d576e645",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  // stables
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x51597f405303C4377E36123cBc172b13269EA163",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.TUSD,
    aggregator: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  // Jarvis
  {
    symbol: assetSymbols.jBRL,
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.JEUR,
    aggregator: "0x0bf79F617988C472DcA68ff41eFe1338955b9A80",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BRZ,
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.ALPACA,
    aggregator: "0xe0073b60833249ffd1bb2af809112c2fbf221DF6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BNBx,
    aggregator: "0xc4429B539397a3166eF3ef132c29e34715a3ABb4",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x13A9c98b07F098c5319f4FF786eB16E22DC738e1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.RDNT,
    aggregator: "0x20123C6ebd45c6496102BeEA86e1a6616Ca547c6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  }
];

// TODO use these as funding and redemption strategies
// https://docs.ellipsis.finance/deployment-links
const curvePools: CurvePoolConfig[] = [
  {
    // 3EPS
    lpToken: underlying(assets, assetSymbols["3EPS"]),
    pool: "0x160CAed03795365F3A589f10C379FfA7d75d4E76",
    underlyings: [
      underlying(assets, assetSymbols.BUSD),
      underlying(assets, assetSymbols.USDC),
      underlying(assets, assetSymbols.USDT)
    ]
  },
  {
    // 2BRL pool
    lpToken: underlying(assets, assetSymbols["2brl"]),
    pool: "0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3",
    underlyings: [underlying(assets, assetSymbols.jBRL), underlying(assets, assetSymbols.BRZ)]
  }
];

const curveV2Pools: CurveV2PoolConfig[] = [
  {
    // BNBx-BNB pool
    lpToken: underlying(assets, assetSymbols["epsBNBx-BNB"]),
    pool: "0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA"
  }
];

const wombatAssets: WombatAsset[] = [
  {
    symbol: assetSymbols["WOMBATLP-WBNB"],
    underlying: underlying(assets, assetSymbols["WOMBATLP-WBNB"])
  }
];

const algebraOracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.THE),
    poolAddress: "0x51Bd5e6d3da9064D59BcaA5A76776560aB42cEb8",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.WBNB)
  }
];

const solidlyLps: SolidlyLpAsset[] = [
  { lpTokenAddress: underlying(assets, assetSymbols["sAMM-jBRL/BRZ"]) },
  { lpTokenAddress: underlying(assets, assetSymbols["sAMM-HAY/BUSD"]) },
  { lpTokenAddress: underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"]) },
  { lpTokenAddress: underlying(assets, assetSymbols["vAMM-ANKR/HAY"]) },
  { lpTokenAddress: underlying(assets, assetSymbols["sAMM-stkBNB/WBNB"]) }
];

const gammaLps: GammaLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.aWBNB_STKBNB)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aWBNB_BTCB)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aWBNB_ETH)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_ANKR_N)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_ANKR_W)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_RDNT_N)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_RDNT_W)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_THE_N)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.aANKRBNB_THE_W)
  }
];

const solidlyOracleSupportedStables: string[] = [
  deployConfig.stableToken!,
  underlying(assets, assetSymbols.USDC),
  underlying(assets, assetSymbols.ankrBNB),
  underlying(assets, assetSymbols.FRAX),
  underlying(assets, assetSymbols.BUSD)
];

const solidlyOracles: SolidlyOracleAssetConfig[] = [
  {
    underlying: underlying(assets, assetSymbols.HAY),
    poolAddress: "0x93B32a8dfE10e9196403dd111974E325219aec24", // sAMM-HAY-BUSD
    baseToken: underlying(assets, assetSymbols.BUSD)
  },
  {
    underlying: underlying(assets, assetSymbols.ANKR),
    poolAddress: "0x7ef540f672Cd643B79D2488344944499F7518b1f", // vAMM-ankrBNB-ANKR
    baseToken: underlying(assets, assetSymbols.ankrBNB)
  },
  {
    underlying: underlying(assets, assetSymbols.MAI),
    poolAddress: "0x49ad051F4263517BD7204f75123b7C11aF9Fd31C", // sAMM-MAI-FRAX
    baseToken: underlying(assets, assetSymbols.FRAX)
  },
  {
    underlying: underlying(assets, assetSymbols.pSTAKE),
    poolAddress: "0x67e51F1DE32318f3a27265287ed766839A62Cf13", // sAMM-BUSD-pSTAKE
    baseToken: underlying(assets, assetSymbols.BUSD)
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES
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

  //// deploy algebra price oracle
  await deployAlgebraPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    concentratedLiquidityOracleTokens: algebraOracleTokens
  });

  //// Uniswap Oracle
  await deployUniswapOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig
  });

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

  // set Native BNB price
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  const nativeBnb = underlying(assets, assetSymbols.BNB);

  const existingOracle = await mpo.callStatic.oracles(nativeBnb);
  if (existingOracle === ethers.constants.AddressZero) {
    const fpo = await ethers.getContract("FixedNativePriceOracle", deployer);
    const tx = await mpo.add([nativeBnb], [fpo.address]);
    await tx.wait();
  }

  //// Wombat Price Oracle
  await deployWombatOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    wombatAssets
  });

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig
  });

  //// Solidly LP Oracle
  await deploySolidlyLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    solidlyLps
  });

  //// Gamma LP Oracle
  await deployGammaPoolOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    gammaLps,
    swap: GammaUnderlyingSwap.ALGEBRA
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

  //// Curve V2 LP Oracle
  await deployCurveV2LpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curveV2Pools
  });

  //// stk BNB  oracle
  await deployStkBNBOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets
  });

  // Ankr BNB Certificate oracle
  await deployAnkrCertificateTokenPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
    certificateAssetSymbol: assetSymbols.ankrBNB
  });

  //// Liquidator Redemption Strategies
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

  const solidlyLiquidator = await deployments.deploy("SolidlySwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (solidlyLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(solidlyLiquidator.transactionHash);
  }
  console.log("SolidlySwapLiquidator: ", solidlyLiquidator.address);

  const solidlyLpTokenLiquidator = await deployments.deploy("SolidlyLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (solidlyLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(solidlyLpTokenLiquidator.transactionHash);
  }
  console.log("SolidlyLpTokenLiquidator: ", solidlyLpTokenLiquidator.address);

  /// curve LP tokens
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  // curve swap underlying tokens
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

  // wombat Lp token liquidator
  const wombatLpTokenLiquidator = await deployments.deploy("WombatLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true
  });
  if (wombatLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(wombatLpTokenLiquidator.transactionHash);
  console.log("WombatLpTokenLiquidator: ", wombatLpTokenLiquidator.address);

  // Gamma Algebra LP token liquidator
  const gammaAlgebraLpTokenLiquidator = await deployments.deploy("GammaAlgebraLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (gammaAlgebraLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(gammaAlgebraLpTokenLiquidator.transactionHash);
  }
  console.log("GammaAlgebraLpTokenLiquidator: ", gammaAlgebraLpTokenLiquidator.address);

  //// Liquidator Funding Strategies

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

  //// deploy ankr bnb adjustable interest rate model
  const abairm = await deployments.deploy("AdjustableAnkrBNBIrm", {
    from: deployer,
    args: [
      {
        blocksPerYear: deployConfig.blocksPerYear,
        multiplierPerYear: ethers.utils.parseEther("0.4").toString(),
        jumpMultiplierPerYear: ethers.utils.parseEther("4").toString(),
        kink: ethers.utils.parseEther("0.75").toString()
      },
      {
        day: 3,
        rate_provider: "0xCb0006B31e6b403fEeEC257A8ABeE0817bEd7eBa",
        abond: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827"
      }
    ],
    log: true
  });
  if (abairm.transactionHash) await ethers.provider.waitForTransaction(abairm.transactionHash);
  console.log("AnkrBNBInterestRateModel: ", abairm.address);

  //// deploy ankr bnb interest rate model
  const abirm = await deployments.deploy("AnkrBNBInterestRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      ethers.utils.parseEther("0.005").toString(),
      ethers.utils.parseEther("3").toString(),
      ethers.utils.parseEther("0.8").toString(),
      3,
      "0xCb0006B31e6b403fEeEC257A8ABeE0817bEd7eBa",
      "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827"
    ],
    log: true
  });
  if (abirm.transactionHash) await ethers.provider.waitForTransaction(abirm.transactionHash);
  console.log("AnkrBNBInterestRateModel: ", abirm.address);

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig
  });
  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);

  /// Addresses Provider - set bUSD
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const busdAddress = underlying(assets, assetSymbols.BUSD);
  const busdAddressAp = await addressesProvider.callStatic.getAddress("bUSD");
  if (busdAddressAp != busdAddress) {
    const tx = await addressesProvider.setAddress("bUSD", busdAddress);
    await tx.wait();
    console.log("setAddress bUSD: ", tx.hash);
  }

  // set CurveLpTokenLiquidatorNoRegistry
  const curveLpTokenLiquidatorNoRegistryAddress = await addressesProvider.callStatic.getAddress(
    "CurveLpTokenLiquidatorNoRegistry"
  );
  if (curveLpTokenLiquidatorNoRegistryAddress !== curveLpTokenLiquidatorNoRegistry.address) {
    const tx = await addressesProvider.setAddress(
      "CurveLpTokenLiquidatorNoRegistry",
      curveLpTokenLiquidatorNoRegistry.address
    );
    await tx.wait();
    console.log("setAddress CurveLpTokenLiquidatorNoRegistry: ", tx.hash);
  }

  // set CurveSwapLiquidator
  const curveSwapLiquidatorAddress = await addressesProvider.callStatic.getAddress("CurveSwapLiquidator");
  if (curveSwapLiquidatorAddress !== curveSwapLiquidator.address) {
    const tx = await addressesProvider.setAddress("CurveSwapLiquidator", curveSwapLiquidator.address);
    await tx.wait();
    console.log("setAddress CurveSwapLiquidator: ", tx.hash);
  }
  ////

  // update sd apeswap oracle factory
  await run("oracle:deploy-apeswap-oracle");
};

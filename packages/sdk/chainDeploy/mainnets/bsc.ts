import { bsc } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { constants, ethers } from "ethers";

import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";
import {
  ChainDeployConfig,
  ChainlinkFeedBaseCurrency,
  deployABNBcOracle,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployDiaOracle,
  deployUniswapLpOracle,
  deployUniswapOracle,
} from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import { deployBNBxPriceOracle } from "../helpers/oracles/bnbXOracle";
import { deployCurveV2LpOracle } from "../helpers/oracles/curveLp";
import { deployStkBNBOracle } from "../helpers/oracles/stkBNBOracle";
import { ChainDeployFnParams, ChainlinkAsset, CurvePoolConfig, CurveV2PoolConfig, DiaAsset } from "../helpers/types";

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
        lpSymbol: "Cake-LP",
      },
    ],
    pairInitHashCode: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
    uniswapV2RouterAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    uniswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    uniswapOracleInitialDeployTokens: [
      {
        token: underlying(assets, assetSymbols.BOMB),
        baseToken: underlying(assets, assetSymbols.BTCB),
        pair: underlying(assets, assetSymbols["BTCB-BOMB"]),
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
      {
        token: underlying(assets, assetSymbols.DDD),
        pair: "0xc19956eCA8A3333671490EF6D6d4329Df049dddD", // WBNB-DDD
        baseToken: wbnb,
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
      {
        token: underlying(assets, assetSymbols.EPX),
        pair: "0x30B8A03ba1269cC2daf1Be481bca699DC98D8726", // WBNB-EPX
        baseToken: wbnb,
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
      {
        token: underlying(assets, assetSymbols.pSTAKE),
        pair: "0x2bF1c14b71C375B35B4C157790bC4D6e557714FE", // WBNB-pSTAKE
        baseToken: wbnb,
        minPeriod: 1800,
        deviationThreshold: "10000000000000000",
      },
      {
        token: underlying(assets, assetSymbols.SD),
        pair: "0x867EB519b05d9C4798B2EdE0B11197274dfDFcC0", // ApeSwap BUSD-SD
        baseToken: underlying(assets, assetSymbols.BUSD),
        minPeriod: 1800,
        deviationThreshold: "10000000000000000",
      },
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
      underlying(assets, assetSymbols["BTCB-BOMB"]), // BOMB-BTC PCS LP
      underlying(assets, assetSymbols["BTCB-ETH"]), // BTCB-ETH PCS LP
      underlying(assets, assetSymbols["stkBNB-WBNB"]), // stkBNB-WBNB PCS LP
      underlying(assets, assetSymbols["asBNBx-WBNB"]), // BNBx-WBNB ApeSwap LP
    ],
    flashSwapFee: 25,
  },
  dynamicFlywheels: [
    {
      rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
      cycleLength: 1,
      name: "DDD",
    },
    {
      rewardToken: "0xAf41054C1487b0e5E2B9250C0332eCBCe6CE9d71",
      cycleLength: 1,
      name: "EPX",
    },
    {
      rewardToken: "0xa184088a740c695E156F91f5cC086a06bb78b827",
      cycleLength: 1,
      name: "AUTOv2",
    },
  ],
  cgId: bsc.specificParams.cgId,
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.BUSD,
    aggregator: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BTCB,
    aggregator: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.ETH,
    aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // CZ
  {
    symbol: assetSymbols.BETH,
    aggregator: "0x2A3796273d47c4eD363b361D3AEFb7F7E2A13782",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.CAKE,
    aggregator: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  //
  {
    symbol: assetSymbols.AUTO,
    aggregator: "0x88E71E6520E5aC75f5338F5F0c9DeD9d4f692cDA",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BIFI,
    aggregator: "0xaB827b69daCd586A37E80A7d552a4395d576e645",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // stables
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x51597f405303C4377E36123cBc172b13269EA163",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.TUSD,
    aggregator: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // Jarvis
  {
    symbol: assetSymbols.jBRL,
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JCHF,
    aggregator: "0x964261740356cB4aaD0C3D2003Ce808A4176a46d",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JEUR,
    aggregator: "0x0bf79F617988C472DcA68ff41eFe1338955b9A80",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BRZ,
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BRZw,
    aggregator: "0x5cb1Cb3eA5FB46de1CE1D0F3BaDB3212e8d8eF48",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.ALPACA,
    aggregator: "0xe0073b60833249ffd1bb2af809112c2fbf221DF6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
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
      underlying(assets, assetSymbols.USDT),
    ],
  },
  {
    // val3EPS metapool
    lpToken: underlying(assets, assetSymbols.val3EPS),
    pool: "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d",
    underlyings: [
      underlying(assets, assetSymbols.BUSD),
      underlying(assets, assetSymbols.USDC),
      underlying(assets, assetSymbols.USDT),
    ],
  },
  {
    // valdai3EPS metapool
    lpToken: underlying(assets, assetSymbols.valdai3EPS),
    pool: "0x245e8bb5427822FB8fd6cE062d8dd853FbcfABF5",
    underlyings: [underlying(assets, assetSymbols.DAI), underlying(assets, assetSymbols.val3EPS)],
  },
  {
    // 2BRL pool
    lpToken: underlying(assets, assetSymbols["2brl"]),
    pool: "0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3",
    underlyings: [underlying(assets, assetSymbols.jBRL), underlying(assets, assetSymbols.BRZ)],
  },
  {
    // 3BRL pool
    lpToken: underlying(assets, assetSymbols["3brl"]),
    pool: "0x43719DfFf12B04C71F7A589cdc7F54a01da07D7a",
    underlyings: [
      underlying(assets, assetSymbols.jBRL),
      underlying(assets, assetSymbols.BRZ),
      underlying(assets, assetSymbols.BRZw),
    ],
  },
  {
    // BNBx-BNB pool
    lpToken: underlying(assets, assetSymbols["epsBNBx-BNB"]),
    pool: "0xFD4afeAc39DA03a05f61844095A75c4fB7D766DA",
    underlyings: [underlying(assets, assetSymbols.BNBx), underlying(assets, assetSymbols.BNB)],
  },
];

const curveV2Pools: CurveV2PoolConfig[] = [
  {
    // eps BUSD jCHF
    lpToken: underlying(assets, assetSymbols["JCHF-BUSD"]),
    pool: "0xBcA6E25937B0F7E0FD8130076b6B218F595E32e2",
  },
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.MAI,
    underlying: underlying(assets, assetSymbols.MAI),
    feed: "0xA6f83D792372487d7986657320e66b62DccfeC67",
    key: "miMATIC/USD",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES

  // set Native BNB price
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  const nativeBnb = underlying(assets, assetSymbols.BNB);

  // Wombat Lp Token Price Oracle

  const wombatOracle = await deployments.deploy("WombatLpTokenPriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (wombatOracle.transactionHash) {
    await ethers.provider.waitForTransaction(wombatOracle.transactionHash);
  }
  console.log("WombatLpTokenPriceOracle: ", wombatOracle.address);

  const existingOracle = await mpo.callStatic.oracles(nativeBnb);
  if (existingOracle === ethers.constants.AddressZero) {
    const fpo = await ethers.getContract("FixedNativePriceOracle", deployer);
    const tx = await mpo.add([nativeBnb], [fpo.address]);
    await tx.wait();
  }

  //// Dia Price Oracle
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: constants.AddressZero, key: "BNB/USD" },
  });

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets,
  });
  ////

  //// Uniswap Oracle
  await deployUniswapOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// Curve LP Oracle
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools,
  });

  //// Curve V2 LP Oracle
  await deployCurveV2LpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curveV2Pools,
  });

  //// stk BNB  oracle
  await deployStkBNBOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
  });

  //// BNBx  oracle
  await deployBNBxPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
  });

  //// Ankr BNB Certificate oracle
  await deployABNBcOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
  });

  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
  console.log("SimplePriceOracle: ", simplePO.address);

  //// Liquidator Redemption Strategies
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (uniswapLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapLpTokenLiquidator.transactionHash);
  }
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  //// Liquidator Redemption and Funding Strategies

  //// custom uniswap v2 redemptions and funding
  const uniswapV2LiquidatorFunder = await deployments.deploy("UniswapV2LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (uniswapV2LiquidatorFunder.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapV2LiquidatorFunder.transactionHash);
  }
  console.log("UniswapV2LiquidatorFunder: ", uniswapV2LiquidatorFunder.address);

  /// xBOMB<>BOMB
  const xbombLiquidatorFunder = await deployments.deploy("XBombLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (xbombLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(xbombLiquidatorFunder.transactionHash);
  console.log("XBombLiquidatorFunder: ", xbombLiquidatorFunder.address);

  //// JarvisLiquidatorFunder
  const jarvisLiquidatorFunder = await deployments.deploy("JarvisLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (jarvisLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(jarvisLiquidatorFunder.transactionHash);
  console.log("JarvisLiquidatorFunder: ", jarvisLiquidatorFunder.address);

  /// curve LP tokens
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  // curve swap underlying tokens
  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (curveSwapLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(curveSwapLiquidator.transactionHash);
  console.log("CurveSwapLiquidator: ", curveSwapLiquidator.address);

  // curve swap liquidator funder - TODO replace the CurveSwapLiquidator above
  const curveSwapLiquidatorFunder = await deployments.deploy("CurveSwapLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (curveSwapLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(curveSwapLiquidatorFunder.transactionHash);
  console.log("CurveSwapLiquidatorFunder: ", curveSwapLiquidatorFunder.address);

  // wombat Lp token liquidator
  const wombatLpTokenLiquidator = await deployments.deploy("WombatLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
  });
  if (wombatLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(wombatLpTokenLiquidator.transactionHash);
  console.log("WombatLpTokenLiquidator: ", wombatLpTokenLiquidator.address);

  //// deploy ankr bnb interest rate model
  const abirm = await deployments.deploy("AnkrBNBInterestRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      "5000000000000000",
      "3000000000000000000",
      "850000000000000000",
      3,
      "0xBb1Aa6e59E5163D8722a122cd66EBA614b59df0d",
    ],
    log: true,
  });
  if (abirm.transactionHash) await ethers.provider.waitForTransaction(abirm.transactionHash);
  console.log("AnkrBNBInterestRateModel: ", abirm.address);

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig,
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

  console.log(`total gas used for deployments ${deployments.getGasUsed()}`);
};

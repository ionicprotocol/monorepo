import { fantom } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { constants, ethers } from "ethers";

import {
  ChainDeployConfig,
  deployAnkrCertificateTokenPriceOracle,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployCurveV2LpOracle,
  deployDiaOracle,
} from "../helpers";
import { deployBalancerLpPriceOracle } from "../helpers/oracles/balancerLp";
import {
  BalancerLpAsset,
  ChainDeployFnParams,
  ChainlinkAsset,
  ChainlinkFeedBaseCurrency,
  CurvePoolConfig,
  CurveV2PoolConfig,
  DiaAsset,
} from "../helpers/types";

const assets = fantom.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WFTM),
  nativeTokenName: "Wrapped Fantom",
  nativeTokenSymbol: "FTM",
  nativeTokenUsdChainlinkFeed: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
  blocksPerYear: fantom.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"),
    uniswapV2RouterAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    uniswapV2FactoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    uniswapOracleLpTokens: [],
    flashSwapFee: 20,
    uniswapOracleInitialDeployTokens: [],
  },
  dynamicFlywheels: [],
  cgId: fantom.specificParams.cgId,
  stableToken: underlying(assets, assetSymbols.USDC),
  wBTCToken: underlying(assets, assetSymbols.multiBTC),
};

const chainlinkAssets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.BNB,
    aggregator: "0x6dE70f4791C4151E00aD02e969bD900DC961f92a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.multiBTC,
    aggregator: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.multiETH,
    aggregator: "0x11DdD3d147E5b83D01cee7070027092397d63658",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.MAI,
    aggregator: "0x827863222c9C603960dE6FF2c0dD58D457Dcc363",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0x91d5DEFAFfE2854C7D02F50c80FA1fdc8A721e52",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.MIMO,
    underlying: underlying(assets, assetSymbols.MIMO),
    feed: "0xdb547398BA8CBB81E91bC290A70c3588e0d039F7",
    key: "MIMO/USD",
  },
  {
    symbol: assetSymbols.PAR,
    underlying: underlying(assets, assetSymbols.PAR),
    feed: "0xdb547398BA8CBB81E91bC290A70c3588e0d039F7",
    key: "PAR/USD",
  },
];

const balancerLpAssets: BalancerLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.MIMO_PAR_75_25),
  },
];

// https://curve.fi/#/fantom
const curveV2Pools: CurveV2PoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols.PAR_USDC_CURVE),
    pool: "0xC0B78F2e96De56d08C7608697680e935FE47295B",
  },
  {
    lpToken: underlying(assets, assetSymbols.triCrypto),
    pool: "0x3a1659Ddcf2339Be3aeA159cA010979FB49155FF",
  },
];

// https://curve.fi/#/fantom
const curvePools: CurvePoolConfig[] = [
  {
    // 2Pool
    lpToken: underlying(assets, assetSymbols["2pool"]),
    pool: "0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40",
    underlyings: [underlying(assets, assetSymbols.DAI), underlying(assets, assetSymbols.USDC)],
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
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

  //// Dia Price Oracle
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: constants.AddressZero, key: "FTM/USD" },
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

  /// Balancer LP Price Oracle
  await deployBalancerLpPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLpAssets,
  });

  //// AnkrFTMc Oracle
  await deployAnkrCertificateTokenPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
    certificateAssetSymbol: assetSymbols.aFTMc,
  });
  ////
  //// deploy ankr certificate interest rate model
  const afirm = await deployments.deploy("AnkrFTMInterestRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      "5000000000000000",
      "3000000000000000000",
      "800000000000000000",
      3,
      "0xB42bF10ab9Df82f9a47B86dd76EEE4bA848d0Fa2",
    ],
    log: true,
  });

  if (afirm.transactionHash) await ethers.provider.waitForTransaction(afirm.transactionHash);
  console.log("AnkrCertificateInterestRateModel: ", afirm.address);

  // Liquidators

  //// CurveLPLiquidator
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  //// Balancer Lp token liquidator
  const balancerLpTokenLiquidator = await deployments.deploy("BalancerLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (balancerLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(balancerLpTokenLiquidator.transactionHash);
  console.log("BalancerLpTokenLiquidator: ", balancerLpTokenLiquidator.address);

  // Plugins & Rewards
  //   const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
  //     ethers,
  //     getNamedAccounts,
  //     deployments,
  //     run,
  //     deployConfig,
  //   });

  //   console.log("deployed dynamicFlywheels: ", dynamicFlywheels);
};

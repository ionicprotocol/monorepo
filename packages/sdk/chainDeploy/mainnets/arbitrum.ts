import { arbitrum } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployUniswapLpOracle,
  deployUniswapV3Oracle
} from "../helpers";
import {
  ChainDeployFnParams,
  ChainlinkAsset,
  ChainlinkFeedBaseCurrency,
  ConcentratedLiquidityOracleConfig,
  CurvePoolConfig
} from "../helpers/types";

const assets = arbitrum.assets;
const USDC = underlying(assets, assetSymbols.USDC);
const WETH = underlying(assets, assetSymbols.WETH);

export const deployConfig: ChainDeployConfig = {
  wtoken: WETH,
  nativeTokenName: "Wrapped ETH",
  nativeTokenSymbol: "ETH",
  stableToken: USDC,
  nativeTokenUsdChainlinkFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  blocksPerYear: arbitrum.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"),
    uniswapV2RouterAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    uniswapV2FactoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    uniswapV3FactoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    uniswapOracleInitialDeployTokens: [],
    uniswapOracleLpTokens: [],
    flashSwapFee: 25
  },
  dynamicFlywheels: [],
  cgId: arbitrum.specificParams.cgId
};

const uniswapV3OracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.GMX),
    poolAddress: "0x80A9ae39310abf666A87C743d6ebBD0E8C42158E",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: WETH
  },
  {
    assetAddress: underlying(assets, assetSymbols.USDs),
    poolAddress: "0x50450351517117Cb58189edBa6bbaD6284D45902",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: USDC
  }
];

const chainlinkAssets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.BAL,
    aggregator: "0xBE5eA816870D11239c543F84b71439511D70B94f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.BNB,
    aggregator: "0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.CRV,
    aggregator: "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FXS,
    aggregator: "0x36a121448D74Fa81450c992A1a44B9b7377CD3a5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.LINK,
    aggregator: "0xb7c8Fb1dB45007F98A68Da0588e1AA524C317f27",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SUSHI,
    aggregator: "0xb2A8BA74cbca38508BA1632761b56C897060147C",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0x6ce185860a4963106506C203335A2910413708e9",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.MAGIC,
    aggregator: "0x47E55cCec6582838E173f252D08Afd8116c2202d",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.DPX,
    aggregator: "0xc373B9DB0707fD451Bc56bA5E9b029ba26629DF0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.wstETH,
    aggregator: "0xb523AE262D20A936BC152e6023996e46FDC2A95D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.rETH,
    aggregator: "0xF3272CAfe65b190e76caAF483db13424a3e23dD2",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.OHM,
    aggregator: "0x761aaeBf021F19F198D325D7979965D0c7C9e53b",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  }
];

// https://arbitrum.curve.fi/
const curvePools: CurvePoolConfig[] = [];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// deploy uniswap v3 price oracle
  await deployUniswapV3Oracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    concentratedLiquidityOracleTokens: uniswapV3OracleTokens
  });

  //// ORACLES
  //// Uniswap Oracle
  // await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

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

  //// Uniswap Lp Oracle
  await deployUniswapLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

  //// Curve LP Oracle
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools
  });

  // Quoter
  const quoter = await deployments.deploy("Quoter", {
    from: deployer,
    args: [deployConfig.uniswap.uniswapV3FactoryAddress],
    log: true,
    waitConfirmations: 1
  });
  console.log("Quoter: ", quoter.address);

  // Liquidators

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

  //// Uniswap Lp token liquidator
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

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

  ////

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

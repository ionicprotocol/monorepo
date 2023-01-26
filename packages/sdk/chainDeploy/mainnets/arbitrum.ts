import { arbitrum } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deploySaddleLpOracle,
  deployUniswapLpOracle,
  deployUniswapOracle,
  deployUniswapV3Oracle,
} from "../helpers";
import { ChainDeployFnParams, ChainlinkAsset, ChainlinkFeedBaseCurrency, CurvePoolConfig } from "../helpers/types";

const assets = arbitrum.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WETH),
  nativeTokenName: "Wrapped ETH",
  nativeTokenSymbol: "ETH",
  nativeTokenUsdChainlinkFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  blocksPerYear: arbitrum.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"),
    uniswapV2RouterAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    uniswapV2FactoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    uniswapV3FactoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    uniswapOracleInitialDeployTokens: [
      {
        token: underlying(assets, assetSymbols.GOHM),
        pair: "0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D", // WETH-GOHM
        baseToken: underlying(assets, assetSymbols.WETH),
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
    ],
    uniswapOracleLpTokens: [],
    flashSwapFee: 25,
    uniswapV3OracleTokens: [
      {
        assetAddress: underlying(assets, assetSymbols.GMX),
        poolAddress: "0x80A9ae39310abf666A87C743d6ebBD0E8C42158E",
        twapWindowSeconds: ethers.BigNumber.from(30 * 60),
      },
    ],
  },
  dynamicFlywheels: [],
  cgId: arbitrum.specificParams.cgId,
};

const chainlinkAssets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.BAL,
    aggregator: "0xBE5eA816870D11239c543F84b71439511D70B94f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BNB,
    aggregator: "0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.CRV,
    aggregator: "0xaebDA2c976cfd1eE1977Eac079B4382acb849325",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FXS,
    aggregator: "0x36a121448D74Fa81450c992A1a44B9b7377CD3a5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.LINK,
    aggregator: "0xb7c8Fb1dB45007F98A68Da0588e1AA524C317f27",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.SUSHI,
    aggregator: "0xb2A8BA74cbca38508BA1632761b56C897060147C",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0xc5a90A6d7e4Af242dA238FFe279e9f2BA0c64B2e",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.MAGIC,
    aggregator: "0x47E55cCec6582838E173f252D08Afd8116c2202d",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.DPX,
    aggregator: "0xc373B9DB0707fD451Bc56bA5E9b029ba26629DF0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

// https://arbitrum.curve.fi/
const curvePools: CurvePoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols["2pool"]),
    pool: "0x7f90122BF0700F9E7e1F688fe926940E8839F353",
    underlyings: [underlying(assets, assetSymbols.USDC), underlying(assets, assetSymbols.USDT)],
  },
];

// https://saddle.exchange/
const saddlePools: CurvePoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols.saddleFraxBP),
    pool: "0x401AFbc31ad2A3Bc0eD8960d63eFcDEA749b4849",
    underlyings: [underlying(assets, assetSymbols.USDC), underlying(assets, assetSymbols.FRAX)],
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// deploy uniswap v3 price oracle
  await deployUniswapV3Oracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// ORACLES
  //// Uniswap Oracle
  await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

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

  //// Uniswap Lp Oracle
  await deployUniswapLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

  //// Curve LP Oracle
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools,
  });

  //// Saddle LP Oracle
  await deploySaddleLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    saddlePools,
  });

  // Quoter
  const quoter = await deployments.deploy("Quoter", {
    from: deployer,
    args: [deployConfig.uniswap.uniswapV3FactoryAddress],
    log: true,
    waitConfirmations: 1,
  });
  console.log("Quoter: ", quoter.address);

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

  //// Saddle Lp token liquidator
  const saddleLpTokenLiquidator = await deployments.deploy("SaddleLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (saddleLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(saddleLpTokenLiquidator.transactionHash);
  console.log("SaddleLpTokenLiquidator: ", saddleLpTokenLiquidator.address);

  // CurveSwapLiquidator
  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (curveSwapLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(curveSwapLiquidator.transactionHash);
  console.log("CurveSwapLiquidator: ", curveSwapLiquidator.address);

  //// Uniswap Lp token liquidator
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

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

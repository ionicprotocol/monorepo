import { fantom } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployAnkrCertificateTokenPriceOracle, deployChainlinkOracle } from "../helpers";
import { ChainDeployFnParams, ChainlinkAsset, ChainlinkFeedBaseCurrency } from "../helpers/types";

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
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
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

  //// AnkrFTMc Oracle
  await deployAnkrCertificateTokenPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    assets,
    certificateAssetSymbol: assetSymbols.aFTMc,
  });
  // Liquidators

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

import { ethers } from "ethers";

import { SupportedChains } from "../../src";
import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { SupportedAsset } from "../../src/types";
import { ChainDeployConfig, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { deployDiaOracle } from "../helpers/dia";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import { ChainDeployFnParams, ChainlinkAsset, ChainlinkFeedBaseCurrency, DiaAsset } from "../helpers/types";
import { deployUniswapLpOracle } from "../oracles/uniswapLp";

const assets = chainSupportedAssets[SupportedChains.moonbeam];

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xAcc15dC74880C9944775448304B263D191c6077F",
  nativeTokenName: "Moonbeam",
  nativeTokenSymbol: "GLMR",
  nativeTokenUsdChainlinkFeed: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
  blocksPerYear: chainSpecificParams[SupportedChains.moonbeam].blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe31da4209ffcce713230a74b5287fa8ec84797c9e77e1f7cfeccea015cdc97ea"),
    uniswapV2RouterAddress: "0x96b244391D98B62D19aE89b1A4dCcf0fc56970C7",
    uniswapV2FactoryAddress: "0x985BcA32293A7A496300a48081947321177a86FD",
    uniswapOracleInitialDeployTokens: [
      {
        token: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.GLINT)!.underlying,
        baseToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WGLMR)!.underlying,
      },
    ],
    uniswapOracleLpTokens: [
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying, // GLMR-USDC
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying, // GLMR-GLINT
    ],
  },
  plugins: [
    {
      // 0x
      strategy: "BeamERC4626",
      name: "GLMR-GLNT",
      underlying: assets.find((a) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying,
      otherParams: ["0", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      flywheelIndices: [0],
    },
    {
      // 0x
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying, // BOMB
      otherParams: ["1", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "GLMR-USDC",
      flywheelIndices: [0],
    },
  ],
  dynamicFlywheels: [
    {
      rewardToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.GLINT)!.underlying,
      cycleLength: 1,
      name: assetSymbols.GLINT,
    },
  ],
  cgId: chainSpecificParams[SupportedChains.moonbeam].cgId,
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.ATOM,
    aggregator: "0x4F152D143c97B5e8d2293bc5B2380600f274a5dd",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.madWBTC,
    aggregator: "0x8c4425e141979c66423A83bE2ee59135864487Eb",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.xcDOT,
    aggregator: "0x1466b4bD0C4B6B8e1164991909961e0EE6a66d8c",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.ETH,
    aggregator: "0x9ce2388a1696e22F870341C3FC1E89710C7569B5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BNB,
    aggregator: "0x0147f2Ad7F1e2Bc51F998CC128a8355d5AE8C32D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  // stables
  {
    symbol: assetSymbols.madUSDC,
    aggregator: "0xA122591F60115D63421f66F752EF9f6e0bc73abC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.multiUSDC,
    aggregator: "0xA122591F60115D63421f66F752EF9f6e0bc73abC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.madUSDT,
    aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.multiUSDT,
    aggregator: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x05Ec3Fb5B7CB3bE9D7150FBA1Fb0749407e5Aa8a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.FTM,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.FTM)!.underlying,
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "FTM/USD",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// ORACLES
  //// Uniswap Oracle
  await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });
  ////
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae", key: "GLMR/USD" },
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

  //// Uniswap Lp Oracle
  await deployUniswapLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

  //// Uniswap Lp token liquidator
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  ////

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig,
  });

  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);
};

import { moonbeam } from "@midas-capital/chains";
import { assetSymbols, SupportedAsset, SupportedChains } from "@midas-capital/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployDiaOracle,
  deployUniswapLpOracle,
  deployUniswapOracle,
} from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import {
  ChainDeployFnParams,
  ChainlinkAsset,
  ChainlinkFeedBaseCurrency,
  CurvePoolConfig,
  DiaAsset,
} from "../helpers/types";

const assets = moonbeam.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xAcc15dC74880C9944775448304B263D191c6077F",
  nativeTokenName: "Moonbeam",
  nativeTokenSymbol: "GLMR",
  nativeTokenUsdChainlinkFeed: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
  blocksPerYear: moonbeam.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
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
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["USDC-ETH"])!.underlying, // USDC-ETH
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["WGLMR-xcDOT"])!.underlying, // WGLMR-xcDOT
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-madUSDC"])!.underlying, // GLMR-madUSDC
    ],
    flashSwapFee: 30,
  },
  plugins: [
    {
      strategy: "BeamERC4626",
      name: "GLMR-GLNT",
      underlying: assets.find((a) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying,
      otherParams: ["0", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      flywheelIndices: [0],
    },
    {
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying,
      otherParams: ["1", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "GLMR-USDC",
      flywheelIndices: [0],
    },
    {
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["USDC-ETH"])!.underlying,
      otherParams: ["4", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "USDC-ETH",
      flywheelIndices: [0],
    },
    {
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["WGLMR"])!.underlying,
      otherParams: ["5", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "WGLMR",
      flywheelIndices: [0],
    },

    {
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["WGLMR-xcDOT"])!.underlying,
      otherParams: ["13", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "WGLMR-xcDOT",
      flywheelIndices: [0],
    },
    {
      // 0x
      strategy: "BeamERC4626",
      underlying: assets.find((a) => a.symbol === assetSymbols["GLMR-madUSDC"])!.underlying,
      otherParams: ["15", "0xC6ca172FC8BDB803c5e12731109744fb0200587b"], // poolId, vaultAddress
      name: "USDC-ETH",
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
  cgId: moonbeam.specificParams.cgId,
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
    symbol: assetSymbols.stDOT,
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
  {
    symbol: assetSymbols.multiUSDT,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.multiUSDT)!.underlying,
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "USDT/USD",
  },
  {
    symbol: assetSymbols.madUSDT,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.madUSDT)!.underlying,
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "USDT/USD",
  },
  {
    symbol: assetSymbols.multiDAI,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.multiDAI)!.underlying,
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "DAI/USD",
  },
  {
    symbol: assetSymbols.madDAI,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.madDAI)!.underlying,
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "DAI/USD",
  },
];

// https://moonbeam.curve.fi/
const curvePools: CurvePoolConfig[] = [
  {
    lpToken: "0xace58a26b8db90498ef0330fdc9c2655db0c45e2",
    pool: "0xace58a26b8db90498ef0330fdc9c2655db0c45e2",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.madDAI)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.madUSDC)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.madUSDT)!.underlying,
    ],
  },
  {
    lpToken: "0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685",
    pool: "0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.stDOT)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.xcDOT)!.underlying,
    ],
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

  //// Curve LP Oracle
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools,
  });

  // Liquidators

  //// CurveLPLiquidator
  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [deployConfig.wtoken, curveOracle.address],
    log: true,
    waitConfirmations: 1,
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  // CurveSwapLiquidator
  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [deployConfig.wtoken],
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

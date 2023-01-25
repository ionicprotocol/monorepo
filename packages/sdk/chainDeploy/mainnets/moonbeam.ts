import { moonbeam } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployChainlinkOracle,
  deployCurveLpOracle,
  deployDiaOracle,
  deploySaddleLpOracle,
  deployUniswapLpOracle,
  deployUniswapOracle,
} from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import { deployDiaWstDotPriceOracle } from "../helpers/oracles/diaWstDot";
import {
  ChainDeployFnParams,
  ChainlinkAsset,
  ChainlinkFeedBaseCurrency,
  CurvePoolConfig,
  DiaAsset,
} from "../helpers/types";

const assets = moonbeam.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WGLMR),
  nativeTokenName: "Moonbeam",
  nativeTokenSymbol: "GLMR",
  stableToken: underlying(assets, assetSymbols.multiUSDC),
  nativeTokenUsdChainlinkFeed: "0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb",
  blocksPerYear: moonbeam.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x48a6ca3d52d0d0a6c53a83cc3c8688dd46ea4cb786b169ee959b95ad30f61643"),
    uniswapV2RouterAddress: "0x70085a09D30D6f8C4ecF6eE10120d1847383BB57",
    uniswapV2FactoryAddress: "0x68A384D826D3678f78BB9FB1533c7E9577dACc0E",
    uniswapOracleInitialDeployTokens: [
      {
        token: underlying(assets, assetSymbols.CELR),
        baseToken: underlying(assets, assetSymbols.WGLMR),
        pair: underlying(assets, assetSymbols["CELR-GLMR"]), // CELR/WGLMR
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
      {
        token: underlying(assets, assetSymbols.STELLA),
        baseToken: underlying(assets, assetSymbols.WGLMR),
        pair: underlying(assets, assetSymbols["STELLA-GLMR"]), // STELLA/WGLMR
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
      {
        token: underlying(assets, assetSymbols.LDO),
        baseToken: underlying(assets, assetSymbols.WGLMR),
        pair: underlying(assets, assetSymbols["LDO-GLMR"]),
        minPeriod: 1800,
        deviationThreshold: "10000000000000000", // 1%
      },
    ],
    uniswapOracleLpTokens: [
      underlying(assets, assetSymbols["GLMR-USDC"]),
      underlying(assets, assetSymbols["USDC-ETH"]),
      underlying(assets, assetSymbols["WGLMR-xcDOT"]),
      underlying(assets, assetSymbols["STELLA-GLMR"]),
      underlying(assets, assetSymbols["CELR-GLMR"]),
      underlying(assets, assetSymbols["ATOM-GLMR"]),
      underlying(assets, assetSymbols["LDO-GLMR"]),
      underlying(assets, assetSymbols["USDC.wh-GLMR"]),
      underlying(assets, assetSymbols["WBTC.wh-GLMR"]),
      underlying(assets, assetSymbols["WETH.wh-GLMR"]),
      underlying(assets, assetSymbols["DOT.xc-GLMR"]),
      underlying(assets, assetSymbols["wstDOT-DOT.xc"]),
    ],
    flashSwapFee: 25, // stella swap fee
  },
  dynamicFlywheels: [
    {
      rewardToken: underlying(assets, assetSymbols.GLINT),
      cycleLength: 1,
      name: assetSymbols.GLINT,
    },
    {
      rewardToken: underlying(assets, assetSymbols.STELLA),
      cycleLength: 1,
      name: assetSymbols.STELLA,
    },
    {
      rewardToken: underlying(assets, assetSymbols.ATOM),
      cycleLength: 1,
      name: assetSymbols.ATOM,
    },
    {
      rewardToken: underlying(assets, assetSymbols.WGLMR),
      cycleLength: 1,
      name: assetSymbols.WGLMR,
    },
    {
      rewardToken: underlying(assets, assetSymbols.CELR),
      cycleLength: 1,
      name: assetSymbols.CELR,
    },
    {
      rewardToken: underlying(assets, assetSymbols.LDO),
      cycleLength: 1,
      name: assetSymbols.LDO,
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
    symbol: assetSymbols.multiWBTC,
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
    symbol: assetSymbols.multiUSDC,
    aggregator: "0xA122591F60115D63421f66F752EF9f6e0bc73abC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDC_wh,
    aggregator: "0xA122591F60115D63421f66F752EF9f6e0bc73abC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.WETH_wh,
    aggregator: "0x9ce2388a1696e22F870341C3FC1E89710C7569B5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.WBTC_wh,
    aggregator: "0x8c4425e141979c66423A83bE2ee59135864487Eb",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x05Ec3Fb5B7CB3bE9D7150FBA1Fb0749407e5Aa8a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BUSD_wh,
    aggregator: "0x2330fd83662bba3Fc62bc48cC935ca58847A8957",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.FTM,
    underlying: underlying(assets, assetSymbols.FTM),
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "FTM/USD",
  },
  {
    symbol: assetSymbols.multiUSDT,
    underlying: underlying(assets, assetSymbols.multiUSDT),
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "USDT/USD",
  },
  {
    symbol: assetSymbols.USDT_xc,
    underlying: underlying(assets, assetSymbols.USDT_xc),
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "USDT/USD",
  },
  {
    symbol: assetSymbols.multiDAI,
    underlying: underlying(assets, assetSymbols.multiDAI),
    feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae",
    key: "DAI/USD",
  },
];

// https://moonbeam.curve.fi/
const curvePools: CurvePoolConfig[] = [
  {
    lpToken: "0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685",
    pool: "0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685",
    underlyings: [underlying(assets, assetSymbols.stDOT), underlying(assets, assetSymbols.xcDOT)],
  },
];

// https://app.stellaswap.com/ for stable-amm pools
const saddlePools: CurvePoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols.base4pool),
    pool: "0xB1BC9f56103175193519Ae1540A0A4572b1566F6",
    underlyings: [
      underlying(assets, assetSymbols.USDC_wh),
      underlying(assets, assetSymbols.USDT_xc),
      underlying(assets, assetSymbols.BUSD_wh),
      underlying(assets, assetSymbols.FRAX),
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

  // Saddle LP Oracle
  await deploySaddleLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    saddlePools,
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

  // dia stDOT and swtDOT price oracle
  await deployDiaWstDotPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

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

  //// Saddle Lp token liquidator
  const saddleLpTokenLiquidator = await deployments.deploy("SaddleLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("SaddleLpTokenLiquidator: ", saddleLpTokenLiquidator.address);

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

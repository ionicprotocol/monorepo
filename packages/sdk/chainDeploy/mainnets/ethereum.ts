import { ethereum } from "@ionicprotocol/chains";
import { assetSymbols, ChainlinkFeedBaseCurrency, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { AddressesProvider } from "../../typechain/AddressesProvider";
import {
  ChainDeployConfig,
  deployBalancerLinearPoolPriceOracle,
  deployBalancerLpPriceOracle,
  deployBalancerStableLpPriceOracle,
  deployChainlinkOracle,
  deployCurveV2Oracle,
  deployDiaOracle,
  deployErc4626PriceOracle,
  deployFlywheelWithDynamicRewards,
  deployUniswapV3Oracle,
  deployWstEthOracle
} from "../helpers";
import {
  BalancerLinearPoolAsset,
  BalancerLpAsset,
  BalancerStableLpAsset,
  ChainDeployFnParams,
  ChainlinkAsset,
  ConcentratedLiquidityOracleConfig,
  CurveV2OracleConfig,
  DiaAsset,
  ERC4626Asset
} from "../helpers/types";

const assets = ethereum.assets;
const USDC = underlying(assets, assetSymbols.USDC);
const WETH = underlying(assets, assetSymbols.WETH);

export const deployConfig: ChainDeployConfig = {
  wtoken: WETH,
  nativeTokenName: "Wrapped ETH",
  nativeTokenSymbol: "ETH",
  stableToken: USDC,
  nativeTokenUsdChainlinkFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  blocksPerYear: ethereum.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    uniswapV2RouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapV2FactoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    uniswapV3FactoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    uniswapOracleInitialDeployTokens: [],
    uniswapOracleLpTokens: [],
    flashSwapFee: 30
  },
  dynamicFlywheels: [],
  cgId: ethereum.specificParams.cgId
};

const chainlinkAssets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.BAL,
    aggregator: "0xdF2917806E30300537aEB49A7663062F4d1F2b5F",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.MIM,
    aggregator: "0x7A364e8770418566e3eb2001A96116E6138Eb32F",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.OHM,
    aggregator: "0x9a72298ae3886221820B1c878d12D872087D3a23",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.ANKR,
    aggregator: "0x7eed379bf00005CfeD29feD4009669dE9Bcc21ce",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.stETH,
    aggregator: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.rETH,
    aggregator: "0x536218f9E9Eb48863970252233c8F271f554C2d0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.cbETH,
    aggregator: "0xF017fcB346A1885194689bA23Eff2fE6fA5C483b",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  }
];

const erc4626Assets: ERC4626Asset[] = [
  {
    assetAddress: underlying(assets, assetSymbols.realYieldUSD)
  },
  {
    assetAddress: underlying(assets, assetSymbols.realYieldETH)
  },
  {
    assetAddress: underlying(assets, assetSymbols.ethBtcTrend)
  }
];

const uniswapV3OracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.PAR),
    poolAddress: "0xD7Dcb0eb6AaB643b85ba74cf9997c840fE32e695",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: USDC
  },
  {
    assetAddress: underlying(assets, assetSymbols.GOHM),
    poolAddress: "0xcF7e21b96a7DAe8e1663b5A266FD812CBE973E70",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: USDC
  },
  {
    assetAddress: underlying(assets, assetSymbols.frxETH),
    poolAddress: "0x8a15b2Dc9c4f295DCEbB0E7887DD25980088fDCB",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: WETH
  }
];

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.swETH,
    underlying: underlying(assets, assetSymbols.swETH),
    feed: "0xf5cECAc781d91b99db6935E975097F552786b7C3",
    key: "swETH/USD"
  }
];

const balancerStableLpAssets: BalancerStableLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.WSTETH_WETH_STABLE_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WBETH_WSTETH_STABLE_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.WSTETH_CBETH_STABLE_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_BOOSTED_STABLE_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.SWETH_BBA_WETH_BPT)
  }
];

const balancerLinerPoolAssets: BalancerLinearPoolAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_LINEAR_DAI)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_LINEAR_USDC)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_LINEAR_USDT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.AAVE_LINEAR_WETH)
  }
];

const balancerLpAssets: BalancerLpAsset[] = [
  {
    lpTokenAddress: underlying(assets, assetSymbols.OHM50_DAI50_BPT)
  },
  {
    lpTokenAddress: underlying(assets, assetSymbols.OHM50_WETH50_BPT)
  }
];

const curveV2OraclePools: CurveV2OracleConfig[] = [
  {
    token: underlying(assets, assetSymbols.eUSD),
    pool: "0x880F2fB3704f1875361DE6ee59629c6c6497a5E3"
  },
  {
    token: underlying(assets, assetSymbols.frxETH),
    pool: "0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577"
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

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

  /// WstEth Oracle
  await deployWstEthOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets
  });

  //// deploy Curve V2 price oracle
  await deployCurveV2Oracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curveV2OraclePools
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

  /// Dia Price Oracle
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: "0xf5cECAc781d91b99db6935E975097F552786b7C3", key: "ETH/USD" }
  });

  // ERC4626 Oracle
  await deployErc4626PriceOracle({ run, ethers, getNamedAccounts, deployments, erc4626Assets });

  /// Balancer Stable LP Price Oracle
  await deployBalancerLinearPoolPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLinerPoolAssets
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

  /// Balancer Stable LP Price Oracle
  await deployBalancerStableLpPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerLpAssets: balancerStableLpAssets
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

  //// ERC4626Liquidator
  const erc4626TokenLiquidator = await deployments.deploy("ERC4626Liquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (erc4626TokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(erc4626TokenLiquidator.transactionHash);
  console.log("ERC4626Liquidator: ", erc4626TokenLiquidator.address);

  ////

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig
  });

  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);

  //// Liquidator Redemption Strategies

  //// UniswapLpTokenLiquidator
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

  // UniswapV3Liquidator
  const uniswapV3Liquidator = await deployments.deploy("UniswapV3Liquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (uniswapV3Liquidator.transactionHash)
    await ethers.provider.waitForTransaction(uniswapV3Liquidator.transactionHash);
  console.log("UniswapV3Liquidator: ", uniswapV3Liquidator.address);

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

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

  /// Addresses Provider
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
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
};

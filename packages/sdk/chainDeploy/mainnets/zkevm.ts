import { zkevm } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { AddressesProvider } from "../../typechain/AddressesProvider";
import {
  ChainDeployConfig,
  configureBalancerSwap,
  deployAlgebraPriceOracle,
  deployAPI3PriceOracle,
  deployBalancerRateProviderPriceOracle
} from "../helpers";
import {
  BalancerRateProviderAsset,
  BalancerSwapTokenLiquidatorData,
  ConcentratedLiquidityOracleConfig,
  PythAsset
} from "../helpers/types";

const assets = zkevm.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: zkevm.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: zkevm.chainAddresses.STABLE_TOKEN,
  wBTCToken: zkevm.chainAddresses.W_BTC_TOKEN,
  blocksPerYear: zkevm.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: ethers.constants.AddressZero,
    uniswapV2FactoryAddress: ethers.constants.AddressZero,
    uniswapV3FactoryAddress: ethers.constants.AddressZero,
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30
  },
  cgId: zkevm.specificParams.cgId
};

const api3Assets: PythAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.USDC),
    feed: "0x8DF7d919Fe9e866259BB4D135922c5Bd96AF6A27"
  },
  {
    underlying: underlying(assets, assetSymbols.USDT),
    feed: "0xF63Fa6EA00678F435Ae3e845541EBb2Db0a1e8fF"
  },
  {
    underlying: underlying(assets, assetSymbols.WBTC),
    feed: "0xe5Cf15fED24942E656dBF75165aF1851C89F21B5"
  },
  {
    underlying: underlying(assets, assetSymbols.DAI),
    feed: "0x6538D9c4b12b5E5E209917D29C097465Ba8EFA02"
  },
  {
    underlying: underlying(assets, assetSymbols.WMATIC),
    feed: "0x3ACccB328Db79Af1B81a4801DAf9ac8370b9FBF8"
  }
];

const algebraOracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.FRAX),
    poolAddress: "0xC4aD89d0A07081871f3007079f816B0757D2638E",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.USDC)
  },
  {
    assetAddress: underlying(assets, assetSymbols.frxETH),
    poolAddress: "0x0B19F0144bD78528C8ACDB6FC38914D855CDb0fa",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.WETH)
  }
];

const balancerRateProviderAssets: BalancerRateProviderAsset[] = [
  {
    tokenAddress: underlying(assets, assetSymbols.rETH),
    baseToken: underlying(assets, assetSymbols.WETH),
    rateProviderAddress: "0x60b39BEC6AF8206d1E6E8DFC63ceA214A506D6c3"
  },
  {
    tokenAddress: underlying(assets, assetSymbols.wstETH),
    baseToken: underlying(assets, assetSymbols.WETH),
    rateProviderAddress: "0x00346D2Fd4B2Dc3468fA38B857409BC99f832ef8"
  }
];

const balancerSwapLiquidatorData: BalancerSwapTokenLiquidatorData[] = [
  {
    inputToken: underlying(assets, assetSymbols.rETH),
    outputToken: underlying(assets, assetSymbols.WETH),
    poolAddress: "0x1d0A8a31CDb04efAC3153237526Fb15cc65A2520"
  },
  {
    inputToken: underlying(assets, assetSymbols.wstETH),
    outputToken: underlying(assets, assetSymbols.WETH),
    poolAddress: "0xe1F2c039a68A216dE6DD427Be6c60dEcf405762A"
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  await deployAPI3PriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    api3Assets,
    nativeTokenUsdFeed: "0x26690F9f17FdC26D419371315bc17950a0FC90eD",
    usdToken: underlying(assets, assetSymbols.USDC)
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
  /// Balancer LP Price Oracle
  await deployBalancerRateProviderPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    balancerRateProviderAssets
  });

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
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  await configureBalancerSwap(addressesProvider, balancerSwapLiquidatorData);
};

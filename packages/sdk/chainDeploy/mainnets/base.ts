import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { ChainlinkAsset, ChainlinkFeedBaseCurrency } from "../helpers/types";

const assets = base.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: base.specificParams.blocksPerYear.toNumber(),
  cgId: base.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: base.chainAddresses.STABLE_TOKEN,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    uniswapV2RouterAddress: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    uniswapV3SwapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
    uniswapV3Quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
  },
  wtoken: base.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: base.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED
};

const chainlinkAssets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.USDC,
    aggregator: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.wstETH,
    aggregator: "0xa669E5272E60f78299F4824495cE01a3923f4380",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.cbETH,
    aggregator: "0x960BDD1dFD20d7c98fa482D793C3dedD73A113a3",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.AERO,
    aggregator: "0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SNX,
    aggregator: "0xe3971Ed6F1A5903321479Ef3148B5950c0612075",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets,
    chainlinkAssets
  });

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

  const solidlySwapLiquidator = await deployments.deploy("SolidlySwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("solidlySwapLiquidator: ", solidlySwapLiquidator.address);
};

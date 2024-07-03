import { base } from "@ionicprotocol/chains";
import { ChainlinkSpecificParams, OracleTypes } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { ChainlinkAsset } from "../helpers/types";

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

const chainlinkAssets: ChainlinkAsset[] = base.assets
  .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .map((asset) => ({
    aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator,
    feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
    symbol: asset.symbol
  }));

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

import { optimism } from "@ionicprotocol/chains";
import { ChainlinkSpecificParams, OracleTypes, PythSpecificParams } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { ChainlinkAsset, PythAsset } from "../helpers/types";

const assets = optimism.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: optimism.specificParams.blocksPerYear.toNumber(),
  cgId: optimism.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: optimism.chainAddresses.STABLE_TOKEN,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: optimism.chainAddresses.UNISWAP_V2_FACTORY,
    uniswapV2RouterAddress: optimism.chainAddresses.UNISWAP_V2_ROUTER,
    uniswapV3SwapRouter: optimism.chainAddresses.UNISWAP_V3_ROUTER,
    uniswapV3Quoter: optimism.chainAddresses.UNISWAP_V3?.QUOTER_V2
  },
  wtoken: optimism.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: optimism.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED
};

const chainlinkAssets: ChainlinkAsset[] = optimism.assets
  .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .map((asset) => ({
    aggregator: (asset.oracleSpecificParams! as ChainlinkSpecificParams).aggregator,
    feedBaseCurrency: (asset.oracleSpecificParams! as ChainlinkSpecificParams).feedBaseCurrency,
    symbol: asset.symbol
  }));

const pythAssets: PythAsset[] = optimism.assets
  .filter((asset) => asset.oracle === OracleTypes.PythPriceOracle)
  .map((asset) => ({ feed: (asset.oracleSpecificParams! as PythSpecificParams).feed, underlying: asset.underlying }));

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

  //// Pyth Price Oracle
  await deployPythPriceOracle({
    run,
    deployConfig,
    ethers,
    getNamedAccounts,
    deployments,
    usdToken: optimism.chainAddresses.STABLE_TOKEN,
    pythAddress: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
    pythAssets,
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
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

import { bob } from "@ionicprotocol/chains";
import { ChainlinkSpecificParams, OracleTypes, PythSpecificParams } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { ChainlinkAsset, PythAsset } from "../helpers/types";

const assets = bob.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: bob.specificParams.blocksPerYear.toNumber(),
  cgId: bob.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: bob.chainAddresses.STABLE_TOKEN,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: bob.chainAddresses.UNISWAP_V2_FACTORY,
    uniswapV2RouterAddress: bob.chainAddresses.UNISWAP_V2_ROUTER,
    uniswapV3SwapRouter: bob.chainAddresses.UNISWAP_V3_ROUTER,
    uniswapV3Quoter: bob.chainAddresses.UNISWAP_V3?.QUOTER_V2
  },
  wtoken: bob.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: bob.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED
};

const chainlinkAssets: ChainlinkAsset[] = bob.assets
  .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .map((asset) => ({
    aggregator: (asset.oracleSpecificParams! as ChainlinkSpecificParams).aggregator,
    feedBaseCurrency: (asset.oracleSpecificParams! as ChainlinkSpecificParams).feedBaseCurrency,
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

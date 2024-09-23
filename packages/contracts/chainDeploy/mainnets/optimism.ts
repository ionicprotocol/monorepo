import { optimism } from "@ionicprotocol/chains";
import { ChainlinkSpecificParams, OracleTypes, PythSpecificParams } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { Address } from "viem";
import { ChainlinkAsset } from "../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = optimism.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(optimism.specificParams.blocksPerYear),
  cgId: optimism.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: optimism.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: optimism.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: optimism.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: optimism.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: optimism.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: optimism.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: optimism.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

const chainlinkAssets: ChainlinkAsset[] = optimism.assets
  .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .map((asset) => ({
    aggregator: (asset.oracleSpecificParams! as ChainlinkSpecificParams).aggregator as Address,
    feedBaseCurrency: (asset.oracleSpecificParams! as ChainlinkSpecificParams).feedBaseCurrency,
    symbol: asset.symbol
  }));

export const deploy = async ({ run, viem, getNamedAccounts, deployments }: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    viem,
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
};

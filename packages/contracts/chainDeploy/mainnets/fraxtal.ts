import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { fraxtal } from "@ionicprotocol/chains";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "viem";
import { ChainlinkSpecificParams, OracleTypes } from "../types";

const assets = fraxtal.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(fraxtal.specificParams.blocksPerYear),
  cgId: fraxtal.specificParams.cgId,
  nativeTokenName: "Fraxtal",
  nativeTokenSymbol: "ETH",
  stableToken: fraxtal.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: fraxtal.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: fraxtal.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: fraxtal.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: fraxtal.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: fraxtal.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: fraxtal.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// ChainlinkV2 Oracle
  const chainlinkAssets = assets
    .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator,
      feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
      symbol: asset.symbol
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: fraxtal.assets,
    chainlinkAssets
  });

  //// Uniswap V3 Liquidator Funder
  const uniswapV2LiquidatorFunder = await deployments.deploy("UniswapV2LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV2LiquidatorFunder: ", uniswapV2LiquidatorFunder.address);
};

import { camptest } from "@ionicprotocol/chains";

import { ChainDeployConfig } from "../helpers";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = camptest.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(camptest.specificParams.blocksPerYear),
  cgId: camptest.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: camptest.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: camptest.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: camptest.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: camptest.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: camptest.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: camptest.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: camptest.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);
};

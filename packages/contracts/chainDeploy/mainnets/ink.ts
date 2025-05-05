import { ink } from "@ionicprotocol/chains";

import { ChainDeployConfig } from "../helpers";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = ink.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(ink.specificParams.blocksPerYear),
  cgId: ink.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: ink.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: ink.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: ink.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: ink.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: ink.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: ink.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: ink.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
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

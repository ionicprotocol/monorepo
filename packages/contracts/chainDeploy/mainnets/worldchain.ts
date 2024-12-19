import { worldchain } from "@ionicprotocol/chains";

import { ChainDeployConfig } from "../helpers";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = worldchain.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(worldchain.specificParams.blocksPerYear),
  cgId: worldchain.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: worldchain.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: worldchain.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: worldchain.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: worldchain.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: worldchain.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: worldchain.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: worldchain.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);
};

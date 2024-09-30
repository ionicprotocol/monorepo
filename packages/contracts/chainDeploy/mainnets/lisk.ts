import { lisk } from "@ionicprotocol/chains";

import { ChainDeployConfig } from "../helpers";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = lisk.assets;
const PRICES_CONTRACT = "0x07F544813E9Fb63D57a92f28FbD3FF0f7136F5cE";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(lisk.specificParams.blocksPerYear),
  cgId: lisk.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: lisk.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: lisk.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: lisk.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: lisk.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: lisk.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: lisk.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: lisk.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
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

import { metalL2 } from "@ionicprotocol/chains";

import { ChainDeployConfig } from "../helpers";
import { Address, parseEther, zeroAddress } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const assets = metalL2.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(metalL2.specificParams.blocksPerYear),
  cgId: metalL2.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: metalL2.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: metalL2.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: metalL2.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: metalL2.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: metalL2.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: metalL2.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: metalL2.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address,
  veION: {
    lpTokens: [],
    lpStakingStrategies: [],
    lpStakingWalletImplementations: [],
    lpExternalStakingContracts: [],
    lpTokenWhitelistStatuses: [],
    lpTokenTypes: [],
    minimumLockAmounts: [],
    minimumLockDuration: 6 * 30 * 24 * 60 * 60,
    maxEarlyWithdrawFee: parseEther("0.8"),
    maxVotingNum: 20
  },
  ION: zeroAddress
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

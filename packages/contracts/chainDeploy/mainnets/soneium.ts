import { soneium } from "@ionicprotocol/chains";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { Address, Hex } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { OracleTypes, PythSpecificParams } from "@ionicprotocol/types";

const assets = soneium.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(soneium.specificParams.blocksPerYear),
  cgId: soneium.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: soneium.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: soneium.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: soneium.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: soneium.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: soneium.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: soneium.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: soneium.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments,
  getChainId
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  const pythAssets = assets
    .filter((a) => a.oracle === OracleTypes.PythPriceOracle)
    .map((a) => ({
      underlying: a.underlying,
      feed: (a.oracleSpecificParams as PythSpecificParams).feed as Hex
    }));
  await deployPythPriceOracle({
    viem,
    getNamedAccounts,
    deployments,
    pythAddress: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    usdToken: soneium.chainAddresses.STABLE_TOKEN as Address,
    pythAssets,
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    deployConfig,
    run,
    chainId
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

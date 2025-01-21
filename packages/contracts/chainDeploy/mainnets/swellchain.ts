import { swellchain } from "@ionicprotocol/chains";

import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { Address, Hex } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { OracleTypes } from "@ionicprotocol/types";
import { ChainlinkSpecificParams } from "@ionicprotocol/types";

const assets = swellchain.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(swellchain.specificParams.blocksPerYear),
  cgId: swellchain.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: swellchain.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: swellchain.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: swellchain.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: swellchain.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: swellchain.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: swellchain.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: swellchain.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
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

  // ChainlinkV2 Oracle
  const chainlinkAssets = assets
    .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
      feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
      symbol: asset.symbol
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: swellchain.assets,
    chainlinkAssets,
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

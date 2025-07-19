import { superseed } from "@ionicprotocol/chains";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { Address, zeroAddress } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { OracleTypes, PythSpecificParams } from "@ionicprotocol/types";
import { PythAsset } from "../types";

const PYTH_ADDRESS = "0x2880aB155794e7179c9eE2e38200202908C17B43";
const PYTH_ETH_USD_FEED = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

const assets = superseed.assets;

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(superseed.specificParams.blocksPerYear),
  cgId: superseed.specificParams.cgId,
  nativeTokenName: "Ethereum",
  nativeTokenSymbol: "ETH",
  stableToken: superseed.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: superseed.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: superseed.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: superseed.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: superseed.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: superseed.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: superseed.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address,
  ION: zeroAddress,
  veION: {} as any
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const pythAssets: PythAsset[] = assets
    .filter((asset) => asset.oracle === OracleTypes.PythPriceOracle)
    .map((asset) => ({
      underlying: asset.underlying,
      feed: (asset.oracleSpecificParams as PythSpecificParams).feed as Address
    }));

  await deployPythPriceOracle({
    chainId: superseed.chainId,
    viem,
    getNamedAccounts,
    deployments,
    run,
    pythAddress: PYTH_ADDRESS,
    usdToken: superseed.chainAddresses.STABLE_TOKEN as Address,
    pythAssets,
    deployConfig,
    nativeTokenUsdFeed: PYTH_ETH_USD_FEED
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

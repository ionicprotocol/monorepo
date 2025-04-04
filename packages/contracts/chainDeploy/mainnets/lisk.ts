import { lisk } from "@ionicprotocol/chains";

import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { Address, formatEther, Hash, Hex, zeroAddress, parseEther } from "viem";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { assetSymbols, ChainlinkSpecificParams, OracleTypes } from "@ionicprotocol/types";
import { addUnderlyingsToMpo } from "../helpers/oracles/utils";

const assets = lisk.assets;
const PRICES_CONTRACT = "0x07F544813E9Fb63D57a92f28FbD3FF0f7136F5cE";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(lisk.specificParams.blocksPerYear),
  cgId: lisk.specificParams.cgId,
  nativeTokenName: "Ethereum",
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
  nativeTokenUsdChainlinkFeed: lisk.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address,
  veION: {
    lpTokens: ["0x076d0CD6228B042aA28E1E6A0894Cf6C97abc23b"],
    lpStakingStrategies: ["VeloAeroStakingStrategy"],
    lpStakingWalletImplementations: ["VeloAeroStakingWallet"],
    lpExternalStakingContracts: ["0x6BFF62258b7BD76F79B4F0818cDDF3628A2fFA58"],
    lpTokenWhitelistStatuses: [true],
    lpTokenTypes: [0],
    minimumLockAmounts: [parseEther("0.01")],
    minimumLockDuration: 6 * 30 * 24 * 60 * 60,
    maxEarlyWithdrawFee: parseEther("0.8"),
    maxVotingNum: 20
  },
  ION: "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5"
};

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  //// ChainlinkV2 Oracle
  const chainlinkAssets = assets
    .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Address,
      feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
      symbol: asset.symbol
    }));
  console.log("🚀 ~ chainlinkAssets:", chainlinkAssets);
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: lisk.assets,
    chainlinkAssets
  });

  const ion = assets.find((asset) => asset.symbol === assetSymbols.ION)?.underlying;
  if (!ion) {
    throw new Error("ION not found");
  }
  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  const simplePriceOracle = await deployments.get("SimplePriceOracle");
  await addUnderlyingsToMpo(mpo as any, [ion], simplePriceOracle.address as Address, deployer, publicClient);
  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);
};

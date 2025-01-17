import { Address, formatEther, Hash, Hex, zeroAddress } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracleDmBTC } from "../helpers";
import { addRedstoneFallbacks } from "../helpers/oracles/redstoneFallbacks";
import { addRedstoneWeETHFallbacks } from "../helpers/oracles/redstoneWeETHFallbacks";
import { deployRedStoneWrsETHPriceOracle } from "../helpers/oracles/redstoneWrsETH";
import { underlying } from "../helpers/utils";
import { mode } from "@ionicprotocol/chains";
import { assetSymbols, OracleTypes, ChainlinkSpecificParams, PythSpecificParams } from "@ionicprotocol/types";
import { ChainlinkAsset, PythAsset, UmbrellaAsset } from "../types";
import { deployVelodromeOracle } from "../helpers/oracles/velodrome";
import { configureAddress } from "../helpers/liquidators/ionicLiquidator";

const KIM_ROUTER = "0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8";
const VELODROME_V2_ROUTER = "0x3a63171DD9BebF4D07BC782FECC7eb0b890C2A45";
const VELODROME_V2_FACTORY = "0x31832f2a97Fd20664D76Cc421207669b55CE4BC0";
const SWAPMODE_ROUTER = "0xc1e624C810D297FD70eF53B0E08F44FABE468591";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: 30 * 60 * 24 * 365, // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: "0x61A31634B4Bb4B9C2556611f563Ed86cE2D4643B",
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: zeroAddress,
    uniswapV2RouterAddress: "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
    uniswapV3SwapRouter: "0xC9Adff795f46105E53be9bbf14221b1C9919EE25",
    uniswapV3Quoter: "0x7Fd569b2021850fbA53887dd07736010aCBFc787"
  },
  wtoken: mode.chainAddresses.W_TOKEN as Address
};

// // TODO add more assets https://pyth.network/developers/price-feed-ids
// const newAssets = ["USDe", "sUSDe"];
// const pythAssets: PythAsset[] = mode.assets
//   .filter((a) => a.oracle === OracleTypes.PythPriceOracle)
//   .filter((a) => newAssets.includes(a.symbol as assetSymbols))
//   .map((a) => ({
//     feed: (a.oracleSpecificParams as PythSpecificParams).feed as Hex,
//     underlying: underlying(mode.assets, a.symbol)
//   }));

const chainlinkAssets: ChainlinkAsset[] = mode.assets
  .filter((a) => a.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .filter((a) => a.symbol === assetSymbols.msDAI)
  .map((a) => ({
    aggregator: (a.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
    feedBaseCurrency: (a.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
    symbol: a.symbol as assetSymbols
  }));

// const velodromeAssets = mode.assets.filter((a) => a.oracle === OracleTypes.VelodromePriceOracle);

// const dMBTC = mode.assets.find((a) => a.symbol === assetSymbols.dMBTC);
// const pythDMBTC = {
//   feed: (dMBTC!.oracleSpecificParams as PythSpecificParams).feed,
//   underlying: dMBTC!.underlying
// } as UmbrellaAsset;

// const api3Assets = [
//   {
//     symbol: assetSymbols.ezETH,
//     aggregator: "0x85baF4a3d1494576d0941a146E24a8690Efa87D5",
//     feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
//   },
//   {
//     symbol: assetSymbols.weETH,
//     aggregator: "0x95a02CBb3f19D88b228858A48cFade87fd337c22",
//     feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
//   }
// ];

// const redStoneWrsETHAssets = [
//   {
//     underlying: underlying(mode.assets, assetSymbols.wrsETH)
//   }
// ];

// const convertedApi3Assets = api3Assets.map((asset) => ({
//   underlying: underlying(mode.assets, asset.symbol),
//   feed: asset.aggregator
// }));

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const deployer = (await getNamedAccounts()).deployer;
  console.log("deployer: ", deployer);
  const publicClient = await viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployer as Address });
  console.log("balance: ", formatEther(balance));

  const ap = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  await configureAddress(ap, publicClient, deployer, "ALGEBRA_SWAP_ROUTER", KIM_ROUTER);

  // const velodromeV2Liquidator = await deployments.deploy("VelodromeV2Liquidator", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: 1
  // });
  // console.log("VelodromeV2Liquidator: ", velodromeV2Liquidator.address);
  await configureAddress(ap, publicClient, deployer, "AERODROME_V2_ROUTER", VELODROME_V2_ROUTER);
  await configureAddress(ap, publicClient, deployer, "AERODROME_V2_FACTORY", VELODROME_V2_FACTORY);

  const uniswapV2Liquidator = await deployments.deploy("UniswapV2LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });

  if (uniswapV2Liquidator.transactionHash) {
    await publicClient.waitForTransactionReceipt({ hash: uniswapV2Liquidator.transactionHash as Hash });
  }
  console.log("UniswapV2LiquidatorFunder: ", uniswapV2Liquidator.address);
  await configureAddress(ap, publicClient, deployer, "IUniswapV2Router02", SWAPMODE_ROUTER);

  const eOracleAssets = mode.assets
    .filter((a) => a.oracle === OracleTypes.eOracle)
    .map((a) => ({
      symbol: a.symbol as assetSymbols,
      aggregator: (a.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
      feedBaseCurrency: (a.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig: { ...deployConfig, nativeTokenUsdChainlinkFeed: "0xf3035649cE73EDF8de7dD9B56f14910335819536" },
    assets: mode.assets,
    chainlinkAssets: eOracleAssets,
    namePostfix: "eOracle",
    chainId: mode.chainId
  });

  // await deployVelodromeOracle({
  //   viem,
  //   assets: velodromeAssets,
  //   deployConfig,
  //   deployments,
  //   getNamedAccounts,
  //   pricesContract: "0xE60bf3d27842fdCAFC2F859032507bA653e0E9A6",
  //   run
  // });

  // await deployPythPriceOracleDmBTC({
  //   run,
  //   deployConfig,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   usdToken: mode.chainAddresses.STABLE_TOKEN as Address,
  //   pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  //   pythAssets: [pythDMBTC],
  //   nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  //   dmBTC: underlying(mode.assets, assetSymbols.dMBTC)
  // });

  const chainlinkAssets = mode.assets
    .filter((a) => a.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((a) => ({
      symbol: a.symbol as assetSymbols,
      aggregator: (a.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
      feedBaseCurrency: (a.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: mode.assets,
    chainlinkAssets,
    chainId: mode.chainId
  });

  // await addRedstoneFallbacks({
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   redStoneAssets: [...pythAssets, convertedApi3Assets[0]],
  //   redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
  //   run,
  //   deployConfig
  // });

  // await addRedstoneWeETHFallbacks({
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   redStoneAssets: [convertedApi3Assets[1]],
  //   redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
  //   run,
  //   deployConfig
  // });

  // await deployRedStoneWrsETHPriceOracle({
  //   run,
  //   deployConfig,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
  //   redStoneAssets: redStoneWrsETHAssets
  // });

  // const algebraSwapLiquidator = await deployments.deploy("AlgebraSwapLiquidator", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: 1
  // });

  // if (algebraSwapLiquidator.transactionHash) {
  //   await publicClient.waitForTransactionReceipt({ hash: algebraSwapLiquidator.transactionHash as Hash });
  // }
  // console.log("AlgebraSwapLiquidator: ", algebraSwapLiquidator.address);
};

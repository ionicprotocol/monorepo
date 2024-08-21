import { Address, Hash, Hex, zeroAddress } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { addRedstoneFallbacks } from "../helpers/oracles/redstoneFallbacks";
import { addRedstoneWeETHFallbacks } from "../helpers/oracles/redstoneWeETHFallbacks";
import { deployRedStoneWrsETHPriceOracle } from "../helpers/oracles/redstoneWrsETH";
import { underlying } from "../helpers/utils";
import { mode } from "@ionicprotocol/chains";
import { assetSymbols, OracleTypes, ChainlinkSpecificParams, PythSpecificParams } from "@ionicprotocol/types";
import { ChainlinkAsset, PythAsset } from "../types";
import { deployVelodromeOracle } from "../helpers/oracles/velodrome";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: 30 * 60 * 24 * 365, // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: "0xa47Fd122b11CdD7aad7c3e8B740FB91D83Ce43D1",
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

// const chainlinkAssets: ChainlinkAsset[] = mode.assets
//   .filter((a) => a.oracle === OracleTypes.ChainlinkPriceOracleV2)
//   .filter((a) => a.symbol === assetSymbols.USDe)
//   .map((a) => ({
//     aggregator: (a.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
//     feedBaseCurrency: (a.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
//     symbol: a.symbol as assetSymbols
//   }));

const velodromeAssets = mode.assets.filter((a) => a.oracle === OracleTypes.VelodromePriceOracle);

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

export const deploy = async ({ run, viem, getNamedAccounts, deployments }: HardhatRuntimeEnvironment): Promise<void> => {
  await deployVelodromeOracle({
    viem,
    assets: velodromeAssets,
    deployConfig,
    deployments,
    getNamedAccounts,
    pricesContract: "0xE60bf3d27842fdCAFC2F859032507bA653e0E9A6",
    run
  });
  // await deployPythPriceOracle({
  //   run,
  //   deployConfig,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   usdToken: mode.chainAddresses.STABLE_TOKEN as Address,
  //   pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  //   pythAssets,
  //   nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  // });
  // await deployChainlinkOracle({
  //   run,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  //   assets: mode.assets,
  //   chainlinkAssets,
  //   namePostfix: "Redstone"
  // });
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

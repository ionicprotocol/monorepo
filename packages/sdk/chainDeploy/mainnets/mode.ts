import { mode } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { addRedstoneFallbacks } from "../helpers/oracles/redstoneFallbacks";
import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { deployChainlinkOracle } from "../helpers";
import { deployRedStoneWrsETHPriceOracle } from "../helpers/oracles/redstoneWrsETH";
import { PythAsset, RedStoneAsset, ChainlinkAsset, ChainlinkFeedBaseCurrency } from "../helpers/types";

import { writeTransactionsToFile } from "../helpers/logging";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: mode.specificParams.blocksPerYear.toNumber(),
  cgId: mode.specificParams.cgId,
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN,
  nativeTokenUsdChainlinkFeed: "0xa47Fd122b11CdD7aad7c3e8B740FB91D83Ce43D1",
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: ethers.constants.AddressZero,
    uniswapV2RouterAddress: "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
    uniswapV3SwapRouter: "0xC9Adff795f46105E53be9bbf14221b1C9919EE25",
    uniswapV3Quoter: "0x7Fd569b2021850fbA53887dd07736010aCBFc787"
  },
  wtoken: mode.chainAddresses.W_TOKEN
};

// TODO add more assets https://pyth.network/developers/price-feed-ids
const pythAssets: PythAsset[] = [
  {
    underlying: underlying(mode.assets, assetSymbols.WETH),
    feed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.USDC),
    feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.USDT),
    feed: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.WBTC),
    feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.mBTC),
    feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  }
];

const api3Assets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.ezETH,
    aggregator: "0x3621b06BfFE478eB481adf65bbF139A052Ed7321",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.weETH,
    aggregator: "0x672020bd166A51A79Ada022B51C974775d17e0f6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  }
];

const redStoneWrsETHAssets: RedStoneAsset[] = [
  {
    underlying: underlying(mode.assets, assetSymbols.wrsETH)
  }
];

const convertedApi3Assets: PythAsset[] = api3Assets.map((asset) => ({
  underlying: underlying(mode.assets, asset.symbol),
  feed: asset.aggregator
}));

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  await deployPythPriceOracle({
    run,
    deployConfig,
    ethers,
    getNamedAccounts,
    deployments,
    usdToken: mode.chainAddresses.STABLE_TOKEN,
    pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    pythAssets,
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  });

  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: mode.assets,
    chainlinkAssets: api3Assets
  });

  await addRedstoneFallbacks({
    ethers,
    getNamedAccounts,
    deployments,
    assets: [...pythAssets, ...convertedApi3Assets]
  });

  await deployRedStoneWrsETHPriceOracle({
    run,
    deployConfig,
    ethers,
    getNamedAccounts,
    deployments,
    redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
    redStoneAssets: redStoneWrsETHAssets
  });

  const deployer = await ethers.getNamedSigner("deployer");
  const algebraSwapLiquidator = await deployments.deploy("AlgebraSwapLiquidator", {
    from: deployer.address,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (algebraSwapLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(algebraSwapLiquidator.transactionHash);
  }
  console.log("AlgebraSwapLiquidator: ", algebraSwapLiquidator.address);
  await writeTransactionsToFile();
};

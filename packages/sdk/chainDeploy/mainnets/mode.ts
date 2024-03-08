import { mode } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { PythAsset, RedStoneAsset } from "../helpers/types";
import { deployRedStonePriceOracle } from "../helpers/oracles/redstone";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: mode.specificParams.blocksPerYear.toNumber(),
  cgId: mode.specificParams.cgId,
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN,
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
  // {
  //   underlying: underlying(mode.assets, assetSymbols.WETH),
  //   feed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  // },
  // {
  //   underlying: underlying(mode.assets, assetSymbols.USDC),
  //   feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  // },
  // {
  //   underlying: underlying(mode.assets, assetSymbols.USDT),
  //   feed: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
  // },
  // {
  //   underlying: underlying(mode.assets, assetSymbols.WBTC),
  //   feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  // }
  // migrate to redstone
];

const redStoneAssets: RedStoneAsset[] = [
  {
    underlying: underlying(mode.assets, assetSymbols.ezETH)
  },
  {
    underlying: underlying(mode.assets, assetSymbols.WBTC)
  },
  {
    underlying: underlying(mode.assets, assetSymbols.USDC)
  },
  {
    underlying: underlying(mode.assets, assetSymbols.USDT)
  },
  {
    underlying: underlying(mode.assets, assetSymbols.WETH)
  },
  {
    underlying: underlying(mode.assets, assetSymbols.weETH)
  }
];

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

  await deployRedStonePriceOracle({
    run,
    deployConfig,
    ethers,
    getNamedAccounts,
    deployments,
    usdToken: mode.chainAddresses.STABLE_TOKEN,
    redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
    redStoneAssets,
    nativeTokenUsdFeed: "0x5553444300000000000000000000000000000000000000000000000000000000"
  });
};

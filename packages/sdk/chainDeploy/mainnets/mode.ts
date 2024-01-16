import { mode } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { PythAsset } from "../helpers/types";
import { ethers } from "ethers";

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
    uniswapV2RouterAddress: ethers.constants.AddressZero,
    uniswapV3SwapRouter: "", // 0xC9Adff795f46105E53be9bbf14221b1C9919EE25
    uniswapV3Quoter: "" //0x7Fd569b2021850fbA53887dd07736010aCBFc787
  },
  wtoken: mode.chainAddresses.W_TOKEN,
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
    underlying: underlying(mode.assets, assetSymbols.UNI),
    feed: "0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.SNX),
    feed: "0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.LINK),
    feed: "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.DAI),
    feed: "0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.BAL),
    feed: "0x07ad7b4a7662d19a6bc675f6b467172d2f3947fa653ca97555a9b20236406628"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.AAVE),
    feed: "0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445"
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
};

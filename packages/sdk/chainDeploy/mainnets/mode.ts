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
    uniswapV2RouterAddress: ethers.constants.AddressZero
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

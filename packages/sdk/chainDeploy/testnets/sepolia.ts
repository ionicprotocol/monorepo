import { sepolia } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { deployRedStonePriceOracle } from "../helpers/oracles/redstone";
import { deployRedStoneWrsETHPriceOracle } from "../helpers/oracles/redstoneWrsETH";
import { PythAsset, RedStoneAsset } from "../helpers/types";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: sepolia.specificParams.blocksPerYear.toNumber(),
  cgId: "ethereum",
  nativeTokenName: "Wrapped ETH",
  nativeTokenSymbol: "ETH",
  stableToken: sepolia.chainAddresses.STABLE_TOKEN,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: sepolia.chainAddresses.UNISWAP_V2_FACTORY,
    uniswapV2RouterAddress: sepolia.chainAddresses.UNISWAP_V2_ROUTER,
    uniswapV3SwapRouter: ethers.constants.AddressZero,
    uniswapV3Quoter: ethers.constants.AddressZero
  },
  wtoken: sepolia.chainAddresses.W_TOKEN
};

// TODO add more assets https://pyth.network/developers/price-feed-ids
const pythAssets: PythAsset[] = [
  {
    underlying: underlying(sepolia.assets, assetSymbols.WETH),
    feed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  },
  {
    underlying: underlying(sepolia.assets, assetSymbols.USDC),
    feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  },
  {
    underlying: underlying(sepolia.assets, assetSymbols.USDT),
    feed: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
  },
  {
    underlying: underlying(sepolia.assets, assetSymbols.WBTC),
    feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  console.log("got here 1");
  await deployPythPriceOracle({
    run,
    deployConfig,
    ethers,
    getNamedAccounts,
    deployments,
    usdToken: sepolia.chainAddresses.STABLE_TOKEN,
    pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    pythAssets,
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
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
};

import { lineagoerli } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployUmbrellaOracle } from "../helpers";
import { UmbrellaAsset } from "../helpers/types";

const assets = lineagoerli.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WETH),
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Linea (Goerli)",
  nativeTokenSymbol: "ETH",
  stableToken: underlying(assets, assetSymbols.USDC),
  blocksPerYear: lineagoerli.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: "0xbdFa4a05372a10172EeEB75075c85FCbff521625",
    uniswapV2FactoryAddress: "",
    uniswapV3FactoryAddress: "0x865412B6cDf424bE36088fE3DeC2A072a26Cc494",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30,
  },
  cgId: lineagoerli.specificParams.cgId,
};

const umbrellaAssets: UmbrellaAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.USDC),
    feed: "USDC-USD",
  },
  {
    underlying: underlying(assets, assetSymbols.WETH),
    feed: "ETH-USD",
  },
  {
    underlying: underlying(assets, assetSymbols.WBTC),
    feed: "BTC-USD",
  },
  {
    underlying: underlying(assets, assetSymbols.USDT),
    feed: "USDT-USD",
  },
  {
    underlying: underlying(assets, assetSymbols.DAI),
    feed: "DAI-USD",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  await deployUmbrellaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    umbrellaAssets,
    nativeUsdFeed: "ETH-USD",
    registryAddress: "0x92010E763d476A732021191562134c488ca92a1F",
  });
};

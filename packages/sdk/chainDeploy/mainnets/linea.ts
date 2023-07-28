import { linea } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";
import { PythAsset, UmbrellaAsset } from "../helpers/types";

const assets = linea.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: linea.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Linea",
  nativeTokenSymbol: "ETH",
  stableToken: linea.chainAddresses.STABLE_TOKEN,
  wBTCToken: linea.chainAddresses.W_BTC_TOKEN,
  blocksPerYear: linea.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: "0xbdFa4a05372a10172EeEB75075c85FCbff521625",
    uniswapV2FactoryAddress: "",
    uniswapV3FactoryAddress: "0x865412B6cDf424bE36088fE3DeC2A072a26Cc494",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30
  },
  cgId: linea.specificParams.cgId
};

// const umbrellaAssets: UmbrellaAsset[] = [
//   {
//     underlying: underlying(assets, assetSymbols.USDC),
//     feed: "USDC-USD"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.WETH),
//     feed: "ETH-USD"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.WBTC),
//     feed: "BTC-USD"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.USDT),
//     feed: "USDT-USD"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.DAI),
//     feed: "DAI-USD"
//   }
// ];

const pythAssets: PythAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.USDC),
    feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  },
  {
    underlying: underlying(assets, assetSymbols.WBTC),
    feed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
  },
  {
    underlying: underlying(assets, assetSymbols.WETH),
    feed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  },

  {
    underlying: underlying(assets, assetSymbols.BUSD),
    feed: "0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814"
  },
  {
    underlying: underlying(assets, assetSymbols.WBNB),
    feed: "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f"
  },
  {
    underlying: underlying(assets, assetSymbols.WMATIC),
    feed: "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52"
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  await deployPythPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    pythAssets,
    pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    usdToken: underlying(assets, assetSymbols.USDC)
  });
};

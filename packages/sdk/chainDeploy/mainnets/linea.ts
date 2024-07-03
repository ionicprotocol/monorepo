import { linea } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, deployKyberSwapPriceOracle, deployUmbrellaOracle } from "../helpers";
import { ConcentratedLiquidityOracleConfig, UmbrellaAsset } from "../helpers/types";

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

const umbrellaAssets: UmbrellaAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.USDC),
    feed: "USDC-USD"
  },
  {
    underlying: underlying(assets, assetSymbols.WETH),
    feed: "ETH-USD"
  },
  {
    underlying: underlying(assets, assetSymbols.WBTC),
    feed: "WBTC-USD"
  },
  {
    underlying: underlying(assets, assetSymbols.USDT),
    feed: "USDT-USD"
  }
];

const kyberSwapOracleTokens: Array<ConcentratedLiquidityOracleConfig> = [
  {
    assetAddress: underlying(assets, assetSymbols.DAI),
    poolAddress: "0xB6E91bA27bB6C3b2ADC31884459D3653F9293e33",
    twapWindow: ethers.BigNumber.from(30 * 60),
    baseToken: underlying(assets, assetSymbols.USDC)
  }
];

// const pythAssets: PythAsset[] = [
//   {
//     underlying: underlying(assets, assetSymbols.BUSD),
//     feed: "0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.WBNB),
//     feed: "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f"
//   },
//   {
//     underlying: underlying(assets, assetSymbols.WMATIC),
//     feed: "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52"
//   }
// ];

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
    registryAddress: "0x1B17DBB40fbED8735E7fE8C9eB02C20984fAdfD6"
  });

  //// deploy algebra price oracle
  await deployKyberSwapPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    concentratedLiquidityOracleTokens: kyberSwapOracleTokens
  });
  // await deployPythPriceOracle({
  //   run,
  //   ethers,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  //   pythAssets,
  //   pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  //   nativeTokenUsdFeed: "0x",
  //   usdToken: underlying(assets, assetSymbols.USDC)
  // });
};

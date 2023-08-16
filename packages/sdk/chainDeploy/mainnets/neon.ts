import { neon } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { getCgPrice } from "../helpers/getCgPrice";
import { ChainlinkAsset, PythAsset } from "../helpers/types";

const assets = neon.assets;
const BN = ethers.utils.parseEther("1");

export const deployConfig: ChainDeployConfig = {
  wtoken: neon.chainAddresses.W_TOKEN,
  nativeTokenUsdChainlinkFeed: ethers.constants.AddressZero,
  nativeTokenName: "Neon (Testnet)",
  nativeTokenSymbol: "NEON",
  stableToken: neon.chainAddresses.STABLE_TOKEN,
  wBTCToken: neon.chainAddresses.W_BTC_TOKEN,
  blocksPerYear: neon.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: neon.chainAddresses.PAIR_INIT_HASH,
    uniswapV2RouterAddress: neon.chainAddresses.UNISWAP_V2_ROUTER,
    uniswapV2FactoryAddress: neon.chainAddresses.UNISWAP_V2_FACTORY,
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30
  },
  cgId: neon.specificParams.cgId
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.WETH,
    aggregator: "0xC55B1E0c36A69e2b40BD16759434B071F4bBe8df",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0x002A8368a4fd76C1809765ea66a9AFa3D424d8e0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.SOL,
    aggregator: "0x76721563EC3CF5fB94737Eb583F38f3cD166C7Bb",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0xba92eACD3fb46661E130577cD03fa32E6D4D757a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
  }
];

const pythAssets: PythAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.USDC),
    feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  },
  {
    underlying: underlying(assets, assetSymbols.WETH),
    feed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  },
  {
    underlying: underlying(assets, assetSymbols.WBTC),
    feed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
  }
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const cgPrice = await getCgPrice(deployConfig.cgId);
  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);
  let tx;

  const NEON_FIXED_PRICE_USD_BN = ethers.utils.parseEther(cgPrice.toString());
  console.log(NEON_FIXED_PRICE_USD_BN.toString());

  tx = await simplePriceOracle.setDirectPrice(
    underlying(assets, assetSymbols.USDC),
    BN.mul(1).mul(BN).div(NEON_FIXED_PRICE_USD_BN)
  );
  console.log(`setDirectPrice ${assetSymbols.USDC}`, tx.hash);
  await tx.wait();
  console.log(`setDirectPrice ${assetSymbols.USDC} mined`, tx.hash);

  tx = await masterPriceOracle.add([underlying(assets, assetSymbols.USDC)], [simplePriceOracle.address]);

  await deployPythPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    pythAssets,
    pythAddress: "0x7f2dB085eFC3560AFF33865dD727225d91B4f9A5",
    nativeTokenUsdFeed: "0xd82183dd487bef3208a227bb25d748930db58862c5121198e723ed0976eb92b7",
    usdToken: underlying(assets, assetSymbols.USDC)
  });

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets
  });
};

import { neon } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle } from "../helpers";
import { ChainlinkAsset } from "../helpers/types";

const assets = neon.assets;
const BN = ethers.utils.parseEther("1");
const NEON_FIXED_PRICE_USD_BN = BN.mul(20).div(100);

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WNEON),
  nativeTokenUsdChainlinkFeed: ethers.constants.AddressZero,
  nativeTokenName: "Neon (Testnet)",
  nativeTokenSymbol: "NEON",
  stableToken: underlying(assets, assetSymbols.USDC),
  blocksPerYear: neon.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
    uniswapV2FactoryAddress: "0x6dcDD1620Ce77B595E6490701416f6Dbf20D2f67",
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

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const pyth = await deployments.deploy("Pyth", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("Pyth: ", pyth.address);

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);
  let tx;

  tx = await simplePriceOracle.setDirectPrice(
    underlying(assets, assetSymbols.USDC),
    BN.mul(1).mul(BN).div(NEON_FIXED_PRICE_USD_BN)
  );
  console.log(`setDirectPrice ${assetSymbols.USDC}`, tx.hash);
  await tx.wait();
  console.log(`setDirectPrice ${assetSymbols.USDC} mined`, tx.hash);

  tx = await masterPriceOracle.add([underlying(assets, assetSymbols.USDC)], [simplePriceOracle.address]);
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

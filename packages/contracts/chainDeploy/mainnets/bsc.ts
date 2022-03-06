import { SALT } from "../../deploy/deploy";
import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { ethers } from "ethers";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  nativeTokenUsdChainlinkFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  nativeTokenName: "Binance Network Token",
  nativeTokenSymbol: "BNB",
  uniswapV2RouterAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  uniswapV2FactoryAddress: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  stableToken: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  wBTCToken: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  pairInitHashCode: ethers.utils.hexlify("0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5"),
  blocksPerYear: 20 * 24 * 365 * 60,
  hardcoded: [],
  uniswapData: [{ lpDisplayName: "PancakeSwap", lpName: "Pancake LPs", lpSymbol: "Cake-LP" }],
};

export const assets = [
  {
    symbol: "BUSD",
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    name: "Binance USD",
    decimals: 18,
  },
  {
    symbol: "BTCB",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    name: "Binance BTC",
    decimals: 18,
  },
  {
    symbol: "DAI",
    underlying: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
    name: "Binance DAI",
    decimals: 18,
  },
  {
    symbol: "ETH",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    name: "Binance ETH",
    decimals: 18,
  },
];

export const deploy = async ({ ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES
  const chainlinkMappingUsd = [
    {
      symbol: "BUSD",
      aggregator: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
    {
      symbol: "BTCB",
      aggregator: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
    {
      symbol: "DAI",
      aggregator: "0xE4eE17114774713d2De0eC0f035d4F7665fc025D",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
    {
      symbol: "ETH",
      aggregator: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
  ];

  //// ChainLinkV2 Oracle
  const { cpo, chainLinkv2 } = await deployChainlinkOracle({
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets,
    chainlinkMappingUsd,
  });
  ////

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const admin = await masterPriceOracle.admin();
  if (admin === ethers.constants.AddressZero) {
    let tx = await masterPriceOracle.initialize(
      chainlinkMappingUsd.map((c) => assets.find((a) => a.symbol === c.symbol).underlying),
      Array(chainlinkMappingUsd.length).fill(chainLinkv2.address),
      cpo.address,
      deployer,
      true,
      deployConfig.wtoken
    );
    await tx.wait();
    console.log("MasterPriceOracle initialized", tx.hash);
  } else {
    console.log("MasterPriceOracle already initialized");
  }

  //// Uniswap Oracle
  await deployUniswapOracle({ ethers, getNamedAccounts, deployments, deployConfig });
  ////

  let dep = await deployments.deterministic("SimplePriceOracle", {
    from: deployer,
    salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(SALT)),
    args: [],
    log: true,
  });
  const simplePO = await dep.deploy();
  console.log("SimplePriceOracle: ", simplePO.address);
  ////
};

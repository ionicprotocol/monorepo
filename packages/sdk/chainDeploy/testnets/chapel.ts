import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { ethers } from "ethers";
import { ChainlinkAsset } from "../helpers/types";
import { SupportedAsset } from "../../src/types";
import { SupportedChains } from "../../src";
import { chainSupportedAssets, assetSymbols } from "../../src/chainConfig";

const assets = chainSupportedAssets[SupportedChains.chapel];

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
  nativeTokenUsdChainlinkFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  nativeTokenName: "Binance Coin Token (Testnet)",
  nativeTokenSymbol: "TBNB",
  stableToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BUSD)!.underlying,
  wBTCToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BTCB)!.underlying,
  blocksPerYear: 20 * 24 * 365 * 60,
  uniswap: {
    hardcoded: [
      {
        name: "Binance Bitcoin",
        symbol: "BTCB",
        address: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BTCB)!.underlying,
      },
    ],
    uniswapData: [],
    // see: https://bsc.kiemtienonline360.com/ for addresses
    pairInitHashCode: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
    uniswapV2RouterAddress: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    uniswapV2FactoryAddress: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
    uniswapOracleInitialDeployTokens: [
      {
        token: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.DAI)!.underlying,
        baseToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
      },
      {
        token: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.SAFEMOON)!.underlying,
        baseToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
      },
      {
        token: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDT)!.underlying,
        baseToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BUSD)!.underlying,
      },
    ],
  },
};

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  ////
  //// ORACLES
  const chainlinkAssets: ChainlinkAsset[] = [
    {
      symbol: "BUSD",
      aggregator: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
    {
      symbol: "BTCB",
      aggregator: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
    {
      symbol: "ETH",
      aggregator: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
    },
  ];

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets,
    run,
  });
  ////

  //// Uniswap Oracle
  await deployUniswapOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });
  ////
};

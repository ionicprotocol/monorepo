import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { ethers } from "ethers";
import { Asset, ChainlinkAsset } from "../helpers/types";

const CHAPEL_WTOKEN = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

export const deployConfig: ChainDeployConfig = {
  wtoken: CHAPEL_WTOKEN,
  nativeTokenUsdChainlinkFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  nativeTokenName: "Binance Coin Token (Testnet)",
  nativeTokenSymbol: "TBNB",
  stableToken: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
  wBTCToken: "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",
  blocksPerYear: 20 * 24 * 365 * 60,
  uniswap: {
    hardcoded: [
      {
        name: "Binance Bitcoin",
        symbol: "BTCB",
        address: "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",
      },
    ],
    uniswapData: [],
    // see: https://bsc.kiemtienonline360.com/ for addresses
    pairInitHashCode: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
    uniswapV2RouterAddress: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    uniswapV2FactoryAddress: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
    uniswapOracleInitialDeployTokens: [
      {
        token: "0x8a9424745056Eb399FD19a0EC26A14316684e274", // DAI
        baseToken: CHAPEL_WTOKEN,
      },
      {
        token: "0xDAcbdeCc2992a63390d108e8507B98c7E2B5584a", // SAFEMOON
        baseToken: CHAPEL_WTOKEN,
      },
      {
        token: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684", // USDT
        baseToken: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7", // BUSD
      },
    ],
  },
};

export const assets: Asset[] = [
  {
    symbol: "BUSD",
    underlying: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
    name: "Binance USD",
    decimals: 18,
  },
  {
    symbol: "BTCB",
    underlying: "0x6ce8da28e2f864420840cf74474eff5fd80e65b8",
    name: "Binance BTC",
    decimals: 18,
  },
  {
    symbol: "DAI",
    underlying: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
    name: "Binance DAI",
    decimals: 18,
  },
  {
    symbol: "ETH",
    underlying: "0x8babbb98678facc7342735486c851abd7a0d17ca",
    name: "Binance ETH",
    decimals: 18,
  },
  {
    symbol: "USDT",
    underlying: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684",
    name: "Binance Tether",
    decimals: 18,
  },
];

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
    assets,
    chainlinkAssets,
    run,
  });
  ////

  //// Uniswap Oracle
  await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });
  ////
};

import { evmos } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployAdrastiaOracle,
  deployFluxOracle,
  deployNativeUsdPriceFeed,
  deployUniswapLpOracle,
  deployUniswapOracle,
} from "../helpers";
import { AdrastiaAsset, ChainDeployFnParams, FluxAsset } from "../helpers/types";

const assets = evmos.assets;
const wevmos = underlying(assets, assetSymbols.WEVMOS);

export const deployConfig: ChainDeployConfig = {
  wtoken: wevmos,
  nativeTokenName: "EMVOS",
  nativeTokenSymbol: "EMVOS",
  blocksPerYear: evmos.specificParams.blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute,
  stableToken: underlying(assets, assetSymbols.gUSDC),
  wBTCToken: underlying(assets, assetSymbols.gWBTC),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xa192c894487128ec7b68781ed7bd7e3141d1718df9e4e051e0124b7671d9a6ef"),
    uniswapV2RouterAddress: "0xFCd2Ce20ef8ed3D43Ab4f8C2dA13bbF1C6d9512F",
    uniswapV2FactoryAddress: "0x6aBdDa34Fb225be4610a2d153845e09429523Cd2",
    uniswapOracleInitialDeployTokens: [
      {
        token: underlying(assets, assetSymbols.DIFF),
        baseToken: underlying(assets, assetSymbols.WEVMOS),
        pair: "0x932c2D21fa11A545554301E5E6FB48C3accdFF4D",
        minPeriod: 1800,
        deviationThreshold: "50000000000000000",
      },
    ],
    uniswapOracleLpTokens: [underlying(assets, assetSymbols["WEVMOS-DIFF"])],
    flashSwapFee: 0,
  },
  cgId: "evmos",
};

const fluxAssets: FluxAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.ATOM),
    feed: "0x0c6d78894824876be96774d18f56fb21D7ec7874",
  },
  {
    underlying: underlying(assets, assetSymbols.axlUSDC),
    feed: "0x3B2AF9149360e9F954C18f280aD0F4Adf1B613b8",
  },
  {
    underlying: underlying(assets, assetSymbols.FRAX),
    feed: "0x71712f8142550C0f76719Bc958ba0C28c4D78985",
  },
  {
    underlying: underlying(assets, assetSymbols.gWBTC),
    feed: "0x08fDc3CE77f4449D26461A70Acc222140573956e",
  },
];
const adrastiaAssets: AdrastiaAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.gUSDT),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.gUSDC),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.axlWETH),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.ceWETH),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.gDAI),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.axlWBTC),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.OSMO),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
  {
    underlying: underlying(assets, assetSymbols.JUNO),
    feed: "0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { nativeUsdPriceOracle } = await deployNativeUsdPriceFeed({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    // Adrastia WEVMOS/USD price feed: https://docs.adrastia.io/deployments/evmos
    nativeUsdOracleAddress: "0xd850F64Eda6a62d625209711510f43cD49Ef8798",
    quoteAddress: wevmos,
  });

  // Flux Price Oracle
  await deployFluxOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    fluxAssets,
    deployConfig,
    nativeUsdFeed: nativeUsdPriceOracle.address,
  });

  // Adrastia Price Oracle
  await deployAdrastiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    adrastiaAssets,
    deployConfig,
    nativeUsdFeed: nativeUsdPriceOracle.address,
  });

  //// Uniswap Oracle
  await deployUniswapOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });
};

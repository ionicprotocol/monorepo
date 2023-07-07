import { evmos } from "@ionicprotocol/chains";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  deployAdrastiaOracle,
  deployFluxOracle,
  deployNativeUsdPriceFeed,
  deploySaddleLpOracle,
  deployUniswapLpOracle,
} from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import { AdrastiaAsset, ChainDeployFnParams, CurvePoolConfig, FluxAsset } from "../helpers/types";

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
    uniswapOracleInitialDeployTokens: [],
    uniswapOracleLpTokens: [
      underlying(assets, assetSymbols["WEVMOS-JUNO"]),
      underlying(assets, assetSymbols["WEVMOS-gUSDC"]),
      underlying(assets, assetSymbols["WEVMOS-ceUSDC"]),
      underlying(assets, assetSymbols["WEVMOS-gWETH"]),
      underlying(assets, assetSymbols["ceUSDC-ceUSDT"]),
    ],
    flashSwapFee: 0,
  },
  dynamicFlywheels: [
    {
      rewardToken: underlying(assets, assetSymbols.DIFF),
      cycleLength: 1,
      name: "DIFF",
    },
    {
      rewardToken: underlying(assets, assetSymbols.GRAV),
      cycleLength: 1,
      name: "Gravity",
    },
    {
      rewardToken: underlying(assets, assetSymbols.WEVMOS),
      cycleLength: 1,
      name: "Wrapped EVMOS",
    },
  ],
  cgId: "evmos",
};

const fluxAssets: FluxAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.ATOM),
    feed: "0x0c6d78894824876be96774d18f56fb21D7ec7874",
  },
  {
    underlying: underlying(assets, assetSymbols.FRAX),
    feed: "0x71712f8142550C0f76719Bc958ba0C28c4D78985",
  },
  {
    underlying: underlying(assets, assetSymbols.gWBTC),
    feed: "0x08fDc3CE77f4449D26461A70Acc222140573956e",
  },
  {
    underlying: underlying(assets, assetSymbols.ceUSDT),
    feed: "0x8FeAE79dB32595d8Ee57D40aA7De0512cBe36625",
  },
  {
    underlying: underlying(assets, assetSymbols.axlUSDT),
    feed: "0x8FeAE79dB32595d8Ee57D40aA7De0512cBe36625",
  },
];
const adrastiaAssets: AdrastiaAsset[] = [
  {
    underlying: underlying(assets, assetSymbols.gUSDT),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.axlUSDC),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.ceUSDC),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.gUSDC),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.axlWETH),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.ceWETH),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.gWETH),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.gDAI),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.axlWBTC),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.OSMO),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
  {
    underlying: underlying(assets, assetSymbols.JUNO),
    feed: "0x2a18276F6ee9663e8bc59C08F076279eB9553685",
  },
];

// https://saddle.exchange/
const saddlePools: CurvePoolConfig[] = [
  {
    lpToken: underlying(assets, assetSymbols.kinesisUSDC),
    pool: "0x35bF604084FBE407996c394D3558E58c90281000",
    underlyings: [
      underlying(assets, assetSymbols.axlUSDC),
      underlying(assets, assetSymbols.gUSDC),
      underlying(assets, assetSymbols.ceUSDC),
    ],
  },
  {
    lpToken: underlying(assets, assetSymbols.kinesisUSDT),
    pool: "0x89E9703309DA4aC51C739D7d674F91489830310E",
    underlyings: [
      underlying(assets, assetSymbols.axlUSDT),
      underlying(assets, assetSymbols.gUSDT),
      underlying(assets, assetSymbols.ceUSDT),
    ],
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const { nativeUsdPriceOracle } = await deployNativeUsdPriceFeed({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    // Adrastia WEVMOS/USD price feed: https://docs.adrastia.io/deployments/evmos
    nativeUsdOracleAddress: "0xeA07Ede816EcD52F17aEEf82a50a608Ca5369145",
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

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// Saddle LP Oracle
  await deploySaddleLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    saddlePools,
  });

  //// Saddle Lp token liquidator
  const saddleLpTokenLiquidator = await deployments.deploy("SaddleLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (saddleLpTokenLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(saddleLpTokenLiquidator.transactionHash);
  console.log("SaddleLpTokenLiquidator: ", saddleLpTokenLiquidator.address);

  // Plugins & Rewards
  const dynamicFlywheels = await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig,
  });
  console.log("deployed dynamicFlywheels: ", dynamicFlywheels);
};

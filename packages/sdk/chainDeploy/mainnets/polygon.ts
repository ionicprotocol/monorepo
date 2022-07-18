import { ethers } from "ethers";

import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";
import { SupportedChains } from "../../src";
import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { ChainDeployFnParams, ChainlinkAsset, CurvePoolConfig } from "../helpers/types";
import { deployCurveLpOracle } from "../oracles/curveLp";
import { deployUniswapLpOracle } from "../oracles/uniswapLp";

const assets = chainSupportedAssets[SupportedChains.polygon];
const wmatic = assets.find((a) => a.symbol === assetSymbols.WMATIC)!.underlying;

export const deployConfig: ChainDeployConfig = {
  wtoken: wmatic,
  nativeTokenUsdChainlinkFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  nativeTokenName: "Matic Token",
  nativeTokenSymbol: "MATIC",
  stableToken: assets.find((a) => a.symbol === assetSymbols.USDC)!.underlying,
  wBTCToken: assets.find((a) => a.symbol === assetSymbols.WBTC)!.underlying,
  blocksPerYear: 20 * 24 * 365 * 60,
  uniswap: {
    hardcoded: [],
    uniswapData: [
      {
        lpDisplayName: "Uniswap",
        lpName: "Uniswap LPs",
        lpSymbol: "UNI-LP",
      },
      {
        lpDisplayName: "SushiSwap",
        lpName: "SushiSwap LPs",
        lpSymbol: "SUSHI-LP",
      },
      {
        lpDisplayName: "QuickSwap",
        lpName: "QuickSwap LPs",
        lpSymbol: "QUICK-LP",
      },
    ],

    // quickswap
    pairInitHashCode: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    uniswapV2RouterAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    uniswapV2FactoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    uniswapOracleInitialDeployTokens: [],
    uniswapOracleLpTokens: [
      assets.find((a) => a.symbol === assetSymbols["WMATIC-USDC"])!.underlying,
      assets.find((a) => a.symbol === assetSymbols["WMATIC-ETH"])!.underlying,
      assets.find((a) => a.symbol === assetSymbols["WMATIC-USDT"])!.underlying,
      assets.find((a) => a.symbol === assetSymbols["WETH-WBTC"])!.underlying, // USDC-ETH PCS LP
    ],
  },
  plugins: [],
  cgId: chainSpecificParams[SupportedChains.polygon].cgId,
};

const chainlinkAssets: ChainlinkAsset[] = [
  //
  {
    symbol: assetSymbols.AAVE,
    aggregator: "0xbE23a3AA13038CfC28aFd0ECe4FdE379fE7fBfc4",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.ALCX,
    aggregator: "0x5DB6e61B6159B20F068dc15A47dF2E5931b14f29",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BAL,
    aggregator: "0xD106B538F2A868c28Ca1Ec7E298C3325E0251d66",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.oBNB,
    aggregator: "0x82a6c4AF830caa6c97bb504425f6A66165C2c26e",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.BUSD,
    aggregator: "0xE0dC07D5ED74741CeeDA61284eE56a2A0f7A4Cc9",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.CRV,
    aggregator: "0x336584C8E6Dc19637A5b36206B1c79923111b405",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.CVX,
    aggregator: "0x5ec151834040B4D453A1eA46aA634C1773b36084",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.DAI,
    aggregator: "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.WETH,
    aggregator: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FRAX,
    aggregator: "0x00DBeB1e45485d53DF7C2F0dF1Aa0b6Dc30311d3",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FTM,
    aggregator: "0x58326c0F831b2Dbf7234A4204F28Bba79AA06d5f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.FXS,
    aggregator: "0x6C0fe985D3cAcbCdE428b84fc9431792694d0f51",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.GHST,
    aggregator: "0xDD229Ce42f11D8Ee7fFf29bDB71C7b81352e11be",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.GRT,
    aggregator: "0x3FabBfb300B1e2D7c9B84512fe9D30aeDF24C410",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.LINK,
    aggregator: "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.MKR,
    aggregator: "0xa070427bF5bA5709f70e98b94Cb2F435a242C46C",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.RAI,
    aggregator: "0x7f45273fD7C644714825345670414Ea649b50b16",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.SNX,
    aggregator: "0xbF90A5D9B6EE9019028dbFc2a9E50056d5252894",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.SOL,
    aggregator: "0x10C8264C0935b3B9870013e057f330Ff3e9C56dC",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.SUSHI,
    aggregator: "0x49B0c695039243BBfEb8EcD054EB70061fd54aa0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.YFI,
    aggregator: "0x9d3A43c111E7b2C6601705D9fcF7a70c95b1dc55",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDC,
    aggregator: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.USDT,
    aggregator: "0x0A6513e40db6EB1b165753AD52E80663aeA50545",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.WBTC,
    aggregator: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

// https://docs.ellipsis.finance/deployment-links
const curvePools: CurvePoolConfig[] = [];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets,
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

  //// Uniswap LP Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
  });

  //// Curve LP Oracle
  // await deployCurveLpOracle({
  //   run,
  //   ethers,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  //   curvePools,
  // });

  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
  console.log("SimplePriceOracle: ", simplePO.address);

  //// Liquidator Redemption Strategies
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (uniswapLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapLpTokenLiquidator.transactionHash);
  }
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);

  /// CurveLPLiquidator
  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);
  const curveLpTokenLiquidatorNoRegistry = await deployments.deploy("CurveLpTokenLiquidatorNoRegistry", {
    from: deployer,
    args: [deployConfig.wtoken, curveOracle.address],
    log: true,
    waitConfirmations: 1,
  });
  if (curveLpTokenLiquidatorNoRegistry.transactionHash)
    await ethers.provider.waitForTransaction(curveLpTokenLiquidatorNoRegistry.transactionHash);
  console.log("CurveLpTokenLiquidatorNoRegistry: ", curveLpTokenLiquidatorNoRegistry.address);

  ////

  /// Addresses Provider - set bUSD
  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const tx = await addressesProvider.setAddress("bUSD", assets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying);
  await tx.wait();
  console.log("setAddress: ", tx.hash);
  ////

  console.log(`total gas used for deployments ${deployments.getGasUsed()}`);
};

/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { SupportedChains } from "@midas-capital/types";
import { ethers } from "ethers";

import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";
import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { ChainDeployConfig, ChainlinkFeedBaseCurrency, deployChainlinkOracle, deployUniswapOracle } from "../helpers";
import { deployGelatoGUniPriceOracle } from "../helpers/gelato";
import { ChainDeployFnParams, ChainlinkAsset, CurvePoolConfig, GelatoGUniAsset } from "../helpers/types";
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
      assets.find((a) => a.symbol === assetSymbols["WETH-WBTC"])!.underlying,
    ],
  },
  plugins: [
    {
      // agEUR-jEUR LP
      strategy: "BeefyERC4626",
      name: "AGEURJEUR",
      underlying: assets.find((a) => a.symbol === assetSymbols["AGEUR-JEUR"])!.underlying,
      otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "10"],
    },
    {
      // jEUR-PAR LP
      strategy: "BeefyERC4626",
      name: "JEURPAR",
      underlying: assets.find((a) => a.symbol === assetSymbols["JEUR-PAR"])!.underlying,
      otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "10"],
    },
    {
      // jJPY-JPYC LP
      strategy: "BeefyERC4626",
      name: "JJPYJPYC",
      underlying: assets.find((a) => a.symbol === assetSymbols["JJPY-JPYC"])!.underlying,
      otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "10"],
    },
    {
      // jCAD-CADC LP
      strategy: "BeefyERC4626",
      name: "JCADCADC",
      underlying: assets.find((a) => a.symbol === assetSymbols["JCAD-CADC"])!.underlying,
      otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "10"],
    },
    {
      // jSGD-XSGD LP
      strategy: "BeefyERC4626",
      name: "JSGDXSGD",
      underlying: assets.find((a) => a.symbol === assetSymbols["JSGD-XSGD"])!.underlying,
      otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "10"],
    },
  ],
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
    symbol: assetSymbols.MAI,
    aggregator: "0xd8d483d813547CfB624b8Dc33a00F2fcbCd2D428",
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
  {
    symbol: assetSymbols.AGEUR,
    aggregator: "0x9b88d07B2354eF5f4579690356818e07371c7BeD",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JEUR,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.PAR,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.EURT,
    aggregator: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JJPY,
    aggregator: "0xD647a6fC9BC6402301583C91decC5989d8Bc382D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JPYC,
    aggregator: "0xD647a6fC9BC6402301583C91decC5989d8Bc382D",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JCAD,
    aggregator: "0xACA44ABb8B04D07D883202F99FA5E3c53ed57Fb5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.CADC,
    aggregator: "0xACA44ABb8B04D07D883202F99FA5E3c53ed57Fb5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JSGD,
    aggregator: "0x8CE3cAc0E6635ce04783709ca3CC4F5fc5304299",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.XSGD,
    aggregator: "0x8CE3cAc0E6635ce04783709ca3CC4F5fc5304299",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JNZD,
    aggregator: "0xa302a0B8a499fD0f00449df0a490DedE21105955",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.NZDS,
    aggregator: "0xa302a0B8a499fD0f00449df0a490DedE21105955",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JCHF,
    aggregator: "0xc76f762CedF0F78a439727861628E0fdfE1e70c2",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JMXN,
    aggregator: "0x171b16562EA3476F5C61d1b8dad031DbA0768545",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JGBP,
    aggregator: "0x099a2540848573e94fb1Ca0Fa420b00acbBc845a",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JCNY,
    aggregator: "0x04bB437Aa63E098236FA47365f0268547f6EAB32",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JAUD,
    aggregator: "0x062Df9C4efd2030e243ffCc398b652e8b8F95C6f",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JPLN,
    aggregator: "0xB34BCE11040702f71c11529D00179B2959BcE6C0",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JSEK,
    aggregator: "0xbd92B4919ae82be8473859295dEF0e778A626302",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JKRW,
    aggregator: "0x24B820870F726dA9B0D83B0B28a93885061dbF50",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
  {
    symbol: assetSymbols.JPHP,
    aggregator: "0x218231089Bebb2A31970c3b77E96eCfb3BA006D1",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.USD,
  },
];

// https://polygon.curve.fi/
const curvePools: CurvePoolConfig[] = [
  {
    lpToken: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
    pool: "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.AGEUR)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.JEUR)!.underlying,
    ],
  },
  {
    lpToken: "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
    pool: "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.PAR)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.JEUR)!.underlying,
    ],
  },
  {
    lpToken: "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1",
    pool: "0x2C3cc8e698890271c8141be9F6fD6243d56B39f1",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.JEUR)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.EURT)!.underlying,
    ],
  },
  {
    lpToken: "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc",
    pool: "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.JJPY)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.JPYC)!.underlying,
    ],
  },
  {
    lpToken: "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
    pool: "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.JCAD)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.CADC)!.underlying,
    ],
  },
  {
    lpToken: "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
    pool: "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.JSGD)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.XSGD)!.underlying,
    ],
  },
  {
    lpToken: "0x976A750168801F58E8AEdbCfF9328138D544cc09",
    pool: "0x976A750168801F58E8AEdbCfF9328138D544cc09",
    underlyings: [
      assets.find((a) => a.symbol === assetSymbols.JNZD)!.underlying,
      assets.find((a) => a.symbol === assetSymbols.NZDS)!.underlying,
    ],
  },
];

const gelatoAssets: GelatoGUniAsset[] = [
  {
    // USDC/WETH
    vaultAddress: "0xA173340f1E942c2845bcBCe8EBD411022E18EB13",
  },
  {
    // WBTC/WETH
    vaultAddress: "0x590217ef04BcB96FF6Da991AB070958b8F9E77f0",
  },
  {
    // USDC/PAR
    vaultAddress: "0xC1DF4E2fd282e39346422e40C403139CD633Aacd",
  },
  {
    // WMATIC/USDC
    vaultAddress: "0x4520c823E3a84ddFd3F99CDd01b2f8Bf5372A82a",
  },
  {
    // USDC/agEUR
    vaultAddress: "0x1644de0A8E54626b54AC77463900FcFFD8B94542",
  },
  {
    // WMATIC/WETH
    vaultAddress: "0xDC0eCA1D69ab51C2B2171C870A1506499081dA5B",
  },
  {
    // WMATIC/AAVE
    vaultAddress: "0x3Cc255339a27eFa6c38bEe880F4061AB9b231732",
  },
  {
    // USDC/USDT 0.01 % fee tier
    vaultAddress: "0x2817E729178471DBAC8b1FC190b4fd8e6F3984e3",
  },
  {
    // USDC/USDT 0.05 % fee tier
    vaultAddress: "0x869A75D6F7ae09810c9083684cf22e9A618c8B05",
  },

  {
    // USDC/DAI
    vaultAddress: "0x2aF769150510Ad9eb37D2e63e1E483114d995cBA",
  },
  {
    // WETH/DAI
    vaultAddress: "0x21F65eA5bf55c48A19b195d5d8CB0f708018Ab6c",
  },
  {
    // USDC/DAI
    vaultAddress: "0x2aF769150510Ad9eb37D2e63e1E483114d995cBA",
  },
];

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
  await deployCurveLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    curvePools,
  });

  //// Gelato GUni Oracle
  await deployGelatoGUniPriceOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    gelatoAssets,
  });

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

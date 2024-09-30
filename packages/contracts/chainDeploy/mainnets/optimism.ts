import { optimism } from "@ionicprotocol/chains";
import { assetSymbols, ChainlinkSpecificParams, OracleTypes, PythSpecificParams } from "@ionicprotocol/types";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { Address, zeroAddress } from "viem";
import { ChainlinkAsset } from "../types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployAerodromeOracle } from "../helpers/oracles/aerodrome";
import { configureAddress } from "../helpers/liquidators/ionicLiquidator";

const assets = optimism.assets;
const PRICES_CONTRACT = "0x07F544813E9Fb63D57a92f28FbD3FF0f7136F5cE";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(optimism.specificParams.blocksPerYear),
  cgId: optimism.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: optimism.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: optimism.chainAddresses.UNISWAP_V2_FACTORY as Address,
    uniswapV2RouterAddress: optimism.chainAddresses.UNISWAP_V2_ROUTER as Address,
    uniswapV3SwapRouter: optimism.chainAddresses.UNISWAP_V3_ROUTER as Address,
    uniswapV3Quoter: optimism.chainAddresses.UNISWAP_V3?.QUOTER_V2 as Address
  },
  wtoken: optimism.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: optimism.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

const chainlinkAssets: ChainlinkAsset[] = optimism.assets
  .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  .map((asset) => ({
    aggregator: (asset.oracleSpecificParams! as ChainlinkSpecificParams).aggregator as Address,
    feedBaseCurrency: (asset.oracleSpecificParams! as ChainlinkSpecificParams).feedBaseCurrency,
    symbol: asset.symbol
  }));

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const ap = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  const curveV2OracleNoRegistry = await deployments.deploy("CurveV2LpTokenPriceOracleNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [[], []]
        }
      }
    }
  });
  console.log("CurveV2LpTokenPriceOracleNoRegistry: ", curveV2OracleNoRegistry.address);
  await configureAddress(ap, publicClient, deployer, "CURVE_V2_ORACLE_NO_REGISTRY", curveV2OracleNoRegistry.address);
  const oracle = await viem.getContractAt(
    "CurveV2LpTokenPriceOracleNoRegistry",
    curveV2OracleNoRegistry.address as Address
  );

  const usdmPool = "0xb52c9213d318956bFa26Df2656B161e3cAcbB64d";
  const registered = await oracle.read.poolOf([usdmPool]);
  if (registered === zeroAddress) {
    await oracle.write.registerPool([usdmPool, usdmPool]);
  } else {
    console.log("USDM pool already registered");
  }

  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CurveSwapLiquidator: ", curveSwapLiquidator.address);

  await deployAerodromeOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets.filter((a) => a.symbol === assetSymbols.ION),
    pricesContract: PRICES_CONTRACT
  });

  // ChainLinkV2 Oracle
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets,
    chainlinkAssets
  });

  // //// Uniswap V3 Liquidator Funder
  // const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: 1
  // });
  // console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);
};

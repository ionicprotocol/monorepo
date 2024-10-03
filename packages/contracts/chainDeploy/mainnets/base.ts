import { ChainDeployConfig, deployChainlinkOracle, deployErc4626PriceOracle } from "../helpers";
import { base } from "@ionicprotocol/chains";
import { deployAerodromeOracle } from "../helpers/oracles/aerodrome";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, zeroAddress } from "viem";
import { ChainlinkSpecificParams, OracleTypes } from "../types";
import { configureAddress } from "../helpers/liquidators/ionicLiquidator";

const assets = base.assets;

const pricesContract = "0xee717411f6E44F9feE011835C8E6FAaC5dEfF166";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: Number(base.specificParams.blocksPerYear),
  cgId: base.specificParams.cgId,
  nativeTokenName: "Base",
  nativeTokenSymbol: "ETH",
  stableToken: base.chainAddresses.STABLE_TOKEN as Address,
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
    uniswapV2RouterAddress: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    uniswapV3SwapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
    uniswapV3Quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
  },
  wtoken: base.chainAddresses.W_TOKEN as Address,
  nativeTokenUsdChainlinkFeed: base.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address
};

const AERODROME_V2_ROUTER = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43"; // aero v2
const AERODROME_V2_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da"; // aero v2
const AERODROME_CL_ROUTER = "0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5"; // aero CL

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  //// ERC4626 Oracle
  await deployErc4626PriceOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    erc4626Assets: base.assets
      .filter((asset) => asset.oracle === OracleTypes.ERC4626Oracle)
      .map((asset) => ({
        assetAddress: asset.underlying
      }))
  });

  // //// Aerodrome Oracle
  const aerodromeAssets = base.assets.filter((asset) => asset.oracle === OracleTypes.AerodromePriceOracle);
  await deployAerodromeOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: aerodromeAssets,
    pricesContract
  });

  // ChainlinkV2 Oracle
  const chainlinkAssets = assets
    .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator,
      feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
      symbol: asset.symbol
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: base.assets,
    chainlinkAssets
  });

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

  const usdmPool = "0x63Eb7846642630456707C3efBb50A03c79B89D81";
  const registered = await oracle.read.poolOf([usdmPool]);
  if (registered === zeroAddress) {
    await oracle.write.registerPool([usdmPool, usdmPool]);
  }

  const curveSwapLiquidator = await deployments.deploy("CurveSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CurveSwapLiquidator: ", curveSwapLiquidator.address);

  const aerodromeV2LiquidatorFunder = await deployments.deploy("AerodromeV2Liquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("AerodromeV2Liquidator: ", aerodromeV2LiquidatorFunder.address);
  await configureAddress(ap, publicClient, deployer, "AERODROME_V2_ROUTER", AERODROME_V2_ROUTER);
  await configureAddress(ap, publicClient, deployer, "AERODROME_V2_FACTORY", AERODROME_V2_FACTORY);

  const aerodromeCLLiquidator = await deployments.deploy("AerodromeCLLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("AerodromeCLLiquidator: ", aerodromeCLLiquidator.address);
  await configureAddress(ap, publicClient, deployer, "AERODROME_CL_ROUTER", AERODROME_CL_ROUTER);

  // Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);
};

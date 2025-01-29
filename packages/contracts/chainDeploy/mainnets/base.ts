import { ChainDeployConfig, deployChainlinkOracle, deployErc4626PriceOracle, deployPythPriceOracle } from "../helpers";
import { base, chainIdtoChain } from "@ionicprotocol/chains";
import { deployAerodromeOracle } from "../helpers/oracles/aerodrome";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, Hex, zeroAddress, parseEther } from "viem";
import { configureAddress } from "../helpers/liquidators/ionicLiquidator";
import { deployDiaPriceOracle } from "../helpers/oracles/dia";
import { ChainlinkSpecificParams, DiaSpecificParams, OracleTypes, PythSpecificParams } from "@ionicprotocol/types";
import { addUnderlyingsToMpo } from "../helpers/oracles/utils";

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
  nativeTokenUsdChainlinkFeed: base.chainAddresses.W_TOKEN_USD_CHAINLINK_PRICE_FEED as Address,
  veION: {
    lpTokens: ["0x0FAc819628a7F612AbAc1CaD939768058cc0170c"],
    lpStakingStrategies: ["VeloAeroStakingStrategy"],
    lpStakingWalletImplementations: ["VeloAeroStakingWallet"],
    lpExternalStakingContracts: ["0x9b42e5F8c45222b2715F804968251c747c588fd7"],
    lpTokenWhitelistStatuses: [true],
    lpTokenTypes: [2],
    minimumLockAmounts: [parseEther("0.01")],
    minimumLockDuration: 6 * 30 * 24 * 60 * 60,
    maxEarlyWithdrawFee: parseEther("0.8"),
    ionicAeroVeloPool: "0x0FAc819628a7F612AbAc1CaD939768058cc0170c",
    aeroVoting: "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5",
    aeroVotingBoost: parseEther("1"),
    veAERO: "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4",
    maxVotingNum: 20
  },
  ION: "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5"
};

const AERODROME_V2_ROUTER = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43"; // aero v2
const AERODROME_V2_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da"; // aero v2
const AERODROME_CL_ROUTER = "0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5"; // aero CL

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments,
  getChainId
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });

  //// Fixed Native Oracle
  const fixedNativeAssets = base.assets
    .filter((asset) => asset.oracle === OracleTypes.FixedNativePriceOracle)
    .map((asset) => asset.underlying);
  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  const fixedNativeOracle = await deployments.get("FixedNativePriceOracle");
  await addUnderlyingsToMpo(
    mpo as any,
    fixedNativeAssets,
    fixedNativeOracle.address as Address,
    deployer,
    publicClient
  );

  //// Pyth Oracle
  await deployPythPriceOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    pythAssets: base.assets
      .filter((asset) => asset.oracle === OracleTypes.PythPriceOracle)
      .map((asset) => ({
        feed: (asset.oracleSpecificParams as PythSpecificParams).feed as Hex,
        underlying: asset.underlying
      })),
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    pythAddress: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
    usdToken: base.chainAddresses.STABLE_TOKEN as Address,
    chainId
  });

  // //// ERC4626 Oracle
  await deployErc4626PriceOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    erc4626Assets: base.assets
      .filter((asset) => asset.oracle === OracleTypes.ERC4626Oracle)
      .map((asset) => ({
        assetAddress: asset.underlying
      })),
    chainId
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
    pricesContract,
    chainId
  });

  // ChainlinkV2 Oracle
  const chainlinkAssets = assets
    .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
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
    chainlinkAssets,
    chainId
  });

  const eOracleAssets = base.assets
    .filter((asset) => asset.oracle === OracleTypes.eOracle)
    .map((asset) => ({
      aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator as Hex,
      feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
      symbol: asset.symbol
    }));
  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig: { ...deployConfig, nativeTokenUsdChainlinkFeed: "0x75DfcbeDF377f99898535AeE7Fa1Cd1D1e8E41b0" },
    assets: base.assets,
    chainlinkAssets: eOracleAssets,
    namePostfix: "eOracle",
    chainId
  });

  const diaAssets = base.assets
    .filter((asset) => asset.oracle === OracleTypes.DiaPriceOracle)
    .map((asset) => ({
      feed: (asset.oracleSpecificParams as DiaSpecificParams).feed,
      underlying: asset.underlying,
      key: (asset.oracleSpecificParams as DiaSpecificParams).key,
      symbol: asset.symbol
    }));
  await deployDiaPriceOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    diaAssets,
    chainId
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
      },
      owner: multisig ?? deployer
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

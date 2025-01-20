import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { base } from "@ionicprotocol/chains";
import { deployAerodromeOracle } from "../helpers/oracles/aerodrome";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, parseEther } from "viem";
import { ChainlinkSpecificParams, OracleTypes } from "../types";

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

const aerodromeAssets = base.assets.filter((asset) => asset.oracle === OracleTypes.AerodromePriceOracle);

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  //// Aerodrome Oracle
  await deployAerodromeOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: aerodromeAssets,
    pricesContract
  });

  //// ChainlinkV2 Oracle
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

  //// Uniswap V3 Liquidator Funder
  const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

  const solidlySwapLiquidator = await deployments.deploy("SolidlySwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("solidlySwapLiquidator: ", solidlySwapLiquidator.address);
};

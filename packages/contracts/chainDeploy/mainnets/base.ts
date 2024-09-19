import { ChainDeployConfig, deployChainlinkOracle } from "../helpers";
import { base } from "@ionicprotocol/chains";
import { deployAerodromeOracle } from "../helpers/oracles/aerodrome";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "viem";
import { ChainlinkSpecificParams, OracleTypes } from "../types";
import { prepareAndLogTransaction } from "../helpers/logging";
import { assetSymbols } from "@ionicprotocol/types";

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

const AERODROME_SWAP_ROUTER = "0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5"; // aero CL
const AERODROME_V2_ROUTER = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43"; // aero v2

const aerodromeAssets = base.assets.filter((asset) => asset.oracle === OracleTypes.AerodromePriceOracle);

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  // //// Aerodrome Oracle
  // await deployAerodromeOracle({
  //   run,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  //   assets: aerodromeAssets,
  //   pricesContract
  // });

  //// ChainlinkV2 Oracle
  // const chainlinkAssets = assets
  //   .filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2)
  //   .map((asset) => ({
  //     aggregator: (asset.oracleSpecificParams as ChainlinkSpecificParams).aggregator,
  //     feedBaseCurrency: (asset.oracleSpecificParams as ChainlinkSpecificParams).feedBaseCurrency,
  //     symbol: asset.symbol
  //   }));
  // await deployChainlinkOracle({
  //   run,
  //   viem,
  //   getNamedAccounts,
  //   deployments,
  //   deployConfig,
  //   assets: base.assets,
  //   chainlinkAssets
  // });

  const ap = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  const uniswapV2LiquidatorFunder = await deployments.deploy("UniswapV2LiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapV2LiquidatorFunder: ", uniswapV2LiquidatorFunder.address);
  const univ2Router = await ap.read.getAddress(["IUniswapV2Router02"]);
  console.log("univ2Router: ", univ2Router);
  if (univ2Router !== AERODROME_V2_ROUTER) {
    console.log("IUniswapV2Router02 is not set for Aero v2");
    const owner = await ap.read.owner();
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: ap,
        functionName: "setAddress",
        args: ["IUniswapV2Router02", AERODROME_V2_ROUTER],
        description: "Set IUniswapV2Router02 for Aero v2",
        inputs: [
          {
            internalType: "address",
            name: "key",
            type: "address"
          },
          {
            internalType: "address",
            name: "value",
            type: "address"
          }
        ]
      });
    } else {
      const tx = await ap.write.setAddress(["IUniswapV2Router02", AERODROME_V2_ROUTER]);
      console.log(`Sent tx to set IUniswapV2Router02 for Aero v2: ${tx}`);
    }
  }

  //// Uniswap V3 Liquidator Funder
  // const uniswapV3LiquidatorFunder = await deployments.deploy("UniswapV3LiquidatorFunder", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: 1
  // });
  // console.log("UniswapV3LiquidatorFunder: ", uniswapV3LiquidatorFunder.address);

  // const algebraSwapLiquidator = await deployments.deploy("AlgebraSwapLiquidator", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: 1
  // });
  // console.log("AlgebraSwapLiquidator: ", algebraSwapLiquidator.address);
  // const algebraSwapRouter = await ap.read.getAddress(["ALGEBRA_SWAP_ROUTER"]);
  // console.log("algebraSwapRouter: ", algebraSwapRouter);
  // if (algebraSwapRouter !== AERODROME_SWAP_ROUTER) {
  //   console.log("AlgebraSwapLiquidator is not set for Aero CL");
  //   const owner = await ap.read.owner();
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: ap,
  //       functionName: "setAddress",
  //       args: ["ALGEBRA_SWAP_ROUTER", AERODROME_SWAP_ROUTER],
  //       description: "Set AlgebraSwapLiquidator for Aero CL",
  //       inputs: [
  //         {
  //           internalType: "address",
  //           name: "key",
  //           type: "address"
  //         },
  //         {
  //           internalType: "address",
  //           name: "value",
  //           type: "address"
  //         }
  //       ]
  //     });
  //   } else {
  //     const tx = await ap.write.setAddress(["ALGEBRA_SWAP_ROUTER", AERODROME_SWAP_ROUTER]);
  //     console.log(`Sent tx to set AlgebraSwapLiquidator for Aero CL: ${tx}`);
  //   }
  // }
};

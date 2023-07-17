import { chainIdToConfig } from "@ionicprotocol/chains";
import { constants } from "ethers";

import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { IonicLiquidator } from "../../../typechain/IonicLiquidator";
import {
  AddressesProviderConfigFnParams,
  BalancerSwapTokenLiquidatorData,
  LiquidatorConfigFnParams,
  LiquidatorDeployFnParams,
} from "../types";

export const deployIonicLiquidator = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: LiquidatorDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const fsl = await deployments.deploy("IonicLiquidator", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
            deployConfig.wtoken,
            deployConfig.uniswap.uniswapV2RouterAddress,
            deployConfig.uniswap.flashSwapFee,
          ],
        },
        onUpgrade: {
          methodName: "_becomeImplementation",
          args: [new ethers.utils.AbiCoder().encode(["uint8"], [deployConfig.uniswap.flashSwapFee])],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
  });
  if (fsl.transactionHash) await ethers.provider.waitForTransaction(fsl.transactionHash);
  console.log("IonicLiquidator: ", fsl.address);

  const fuseSafeLiquidator = (await ethers.getContract("IonicLiquidator", deployer)) as IonicLiquidator;
  const fslOwner = await fuseSafeLiquidator.callStatic.owner();
  console.log(`IonicLiquidator owner is ${fslOwner}`);
};

export const configureIonicLiquidator = async ({
  ethers,
  getNamedAccounts,
  chainId,
}: LiquidatorConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const strategies: string[] = [];
  const arrayOfTrue: boolean[] = [];
  const fuseSafeLiquidator = (await ethers.getContract("IonicLiquidator", deployer)) as IonicLiquidator;

  for (const redemptionStrategyConfig of chainIdToConfig[chainId].redemptionStrategies) {
    const { strategy } = redemptionStrategyConfig;
    const redemptionStrategyContract = await ethers.getContract(strategy, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
      redemptionStrategyContract.address
    );
    if (!whitelistedAlready) {
      strategies.push(redemptionStrategyContract.address);
      arrayOfTrue.push(true);
    }
  }

  for (const fundingStrategy of chainIdToConfig[chainId].fundingStrategies) {
    const { strategy } = fundingStrategy;
    const fundingStrategyContract = await ethers.getContract(strategy, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
      fundingStrategyContract.address
    );
    if (!whitelistedAlready) {
      strategies.push(fundingStrategyContract.address);
      arrayOfTrue.push(true);
    }
  }

  if (strategies.length > 0) {
    const tx = await fuseSafeLiquidator._whitelistRedemptionStrategies(strategies, arrayOfTrue);
    await tx.wait();
    console.log("_whitelistRedemptionStrategies: ", tx.hash);
  } else {
    console.log("no redemption strategies for whitelisting");
  }
};

export const configureAddressesProviderAddresses = async ({
  ethers,
  getNamedAccounts,
  chainId,
  deployConfig,
}: AddressesProviderConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const chainConfig = chainIdToConfig[chainId];
  const ap = (await ethers.getContractOrNull("AddressesProvider", deployer)) as AddressesProvider;

  if (ap) {
    /// EXTERNAL ADDRESSES
    await configureAddress(ap, "IUniswapV2Factory", deployConfig.uniswap.uniswapV2FactoryAddress);
    await configureAddress(ap, "IUniswapV2Router02", deployConfig.uniswap.uniswapV2RouterAddress);
    await configureAddress(ap, "wtoken", deployConfig.wtoken);
    await configureAddress(ap, "wBTCToken", deployConfig.wBTCToken);
    await configureAddress(ap, "stableToken", deployConfig.stableToken);
    await configureAddress(ap, "UNISWAP_V3_ROUTER", chainConfig.chainAddresses.UNISWAP_V3_ROUTER);
    await configureAddress(ap, "ALGEBRA_SWAP_ROUTER", chainConfig.chainAddresses.ALGEBRA_SWAP_ROUTER);
    await configureAddress(ap, "SOLIDLY_SWAP_ROUTER", chainConfig.chainAddresses.SOLIDLY_SWAP_ROUTER);

    // CURVE ORACLES
    const clpov1 = await ethers.getContractOrNull("CurveLpTokenPriceOracleNoRegistry");
    await configureAddress(ap, "CurveLpTokenPriceOracleNoRegistry", clpov1?.address);

    const clpov2 = await ethers.getContractOrNull("CurveV2LpTokenPriceOracleNoRegistry");
    await configureAddress(ap, "CurveV2LpTokenPriceOracleNoRegistry", clpov2?.address);

    // LIQUIDATORS
    const csl = await ethers.getContractOrNull("CurveSwapLiquidator");
    await configureAddress(ap, "CurveSwapLiquidator", csl?.address);

    const jlf = await ethers.getContractOrNull("JarvisLiquidatorFunder");
    await configureAddress(ap, "JarvisLiquidatorFunder", jlf?.address);

    const uv2l = await ethers.getContractOrNull("UniswapV2Liquidator");
    await configureAddress(ap, "UniswapV2Liquidator", uv2l?.address);

    const clptlnr = await ethers.getContractOrNull("CurveLpTokenLiquidatorNoRegistry");
    await configureAddress(ap, "CurveLpTokenLiquidatorNoRegistry", clptlnr?.address);

    /// SYSTEM ADDRESSES
    await configureAddress(ap, "deployer", deployer);

    const masterPO = await ethers.getContractOrNull("MasterPriceOracle");
    await configureAddress(ap, "MasterPriceOracle", masterPO?.address);

    const fpd = await ethers.getContractOrNull("PoolDirectory");
    await configureAddress(ap, "PoolDirectory", fpd?.address);

    const ffd = await ethers.getContractOrNull("FeeDistributor");
    await configureAddress(ap, "FeeDistributor", ffd?.address);

    const fsl = await ethers.getContractOrNull("IonicLiquidator");
    await configureAddress(ap, "IonicLiquidator", fsl?.address);

    const dpa = await ethers.getContractOrNull("DefaultProxyAdmin");
    await configureAddress(ap, "DefaultProxyAdmin", dpa?.address);

    const quoter = await ethers.getContractOrNull("Quoter");
    await configureAddress(ap, "Quoter", quoter?.address);

    const lr = await ethers.getContractOrNull("LiquidatorsRegistry");
    await configureAddress(ap, "LiquidatorsRegistry", lr?.address);

    if (chainId !== 1) {
      const ovr = await ethers.getContractOrNull("OptimizedVaultsRegistry");
      await configureAddress(ap, "OptimizedVaultsRegistry", ovr?.address);

      const lpf = await ethers.getContractOrNull("LeveredPositionFactory");
      await configureAddress(ap, "LeveredPositionFactory", lpf?.address);

      const lpl = await ethers.getContractOrNull("LeveredPositionsLens");
      await configureAddress(ap, "LeveredPositionsLens", lpl?.address);
    }

    const mflr = await ethers.getContractOrNull("IonicFlywheelLensRouter");
    await configureAddress(ap, "IonicFlywheelLensRouter", mflr?.address);
  }
};

async function configureAddress(ap: AddressesProvider, key: string, value?: string) {
  if (!value) {
    console.log(`empty value for key ${key}`);
    return;
  }

  const currentValue = await ap.callStatic.getAddress(key);
  if (currentValue && currentValue !== value) {
    const tx = await ap.setAddress(key, value);
    await tx.wait();
    console.log(`setAddress ${key}: ${tx.hash}`);
  }
}

export async function configureBalancerSwap(
  ap: AddressesProvider,
  balancerSwapTokenLiquidatorData: BalancerSwapTokenLiquidatorData[]
) {
  for (const swap of balancerSwapTokenLiquidatorData) {
    const pool = await ap.getBalancerPoolForTokens(swap.inputToken, swap.outputToken);
    if (pool != swap.poolAddress || pool === constants.AddressZero) {
      const tx = await ap.setBalancerPoolForTokens(swap.inputToken, swap.outputToken, swap.poolAddress);
      await tx.wait();
      console.log(
        `setBalancerPoolForTokens input: ${swap.inputToken}, output: ${swap.outputToken}:, pool: ${swap.poolAddress} with tx: ${tx.hash}`
      );
    } else {
      console.log(`pool already configured for ${swap.inputToken} and ${swap.outputToken}`);
    }
  }
}

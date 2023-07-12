import { chainIdToConfig } from "@ionicprotocol/chains";
import { JarvisLiquidityPool } from "@ionicprotocol/types";
import { BigNumber, constants } from "ethers";

import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { FuseSafeLiquidator } from "../../../typechain/FuseSafeLiquidator";
import { BalancerSwapTokenLiquidatorData, LiquidatorConfigFnParams, LiquidatorDeployFnParams } from "../types";

export const deployFuseSafeLiquidator = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: LiquidatorDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const fsl = await deployments.deploy("FuseSafeLiquidator", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
            deployConfig.wtoken,
            deployConfig.uniswap.uniswapV2RouterAddress,
            deployConfig.stableToken ?? constants.AddressZero,
            deployConfig.wBTCToken ?? constants.AddressZero,
            deployConfig.uniswap.pairInitHashCode ?? "0x",
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
  console.log("FuseSafeLiquidator: ", fsl.address);

  const fuseSafeLiquidator = (await ethers.getContract("FuseSafeLiquidator", deployer)) as FuseSafeLiquidator;
  const fslOwner = await fuseSafeLiquidator.callStatic.owner();
  console.log(`FuseSafeLiquidator owner is ${fslOwner}`);
};

export const configureFuseSafeLiquidator = async ({
  ethers,
  getNamedAccounts,
  chainId,
}: LiquidatorConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const strategies: string[] = [];
  const arrayOfTrue: boolean[] = [];
  const fuseSafeLiquidator = (await ethers.getContract("FuseSafeLiquidator", deployer)) as FuseSafeLiquidator;

  for (const redemptionStrategy of chainIdToConfig[chainId].redemptionStrategies) {
    const { strategy } = redemptionStrategy;
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

export const configureAddressesProviderStrategies = async ({
  ethers,
  getNamedAccounts,
  chainId,
}: LiquidatorConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const chainConfig = chainIdToConfig[chainId];

  const redemptionStrategiesToUpdate: {
    outputToken: string;
    strategyAddress: string;
    strategy: string;
    inputToken: string;
  }[] = [];

  const ap = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  // configure the redemption strategies in the AddressesProvider
  for (const redemptionStrategy of chainConfig.redemptionStrategies) {
    const { inputToken, strategy, outputToken } = redemptionStrategy;
    const [onChainStrategyAddress, , onChainOutputToken] = await ap.callStatic.getRedemptionStrategy(inputToken);
    const redemptionStrategyContract = await ethers.getContract(strategy);
    if (onChainStrategyAddress != redemptionStrategyContract.address || onChainOutputToken != outputToken) {
      redemptionStrategiesToUpdate.push({
        inputToken,
        strategyAddress: redemptionStrategyContract.address,
        strategy,
        outputToken,
      });
    }
  }

  if (redemptionStrategiesToUpdate.length > 0) {
    for (const redemptionStrategy of redemptionStrategiesToUpdate) {
      const { inputToken, strategyAddress, strategy, outputToken } = redemptionStrategy;
      console.log(
        `configuring strategy ${strategy} of type ${strategy} for asset ${inputToken} and output token ${outputToken}`
      );
      const tx = await ap.setRedemptionStrategy(inputToken, strategyAddress, strategy, outputToken);
      console.log("waiting for ", tx.hash);
      await tx.wait();
      console.log("setRedemptionStrategy: ", tx.hash);
    }
  } else {
    console.log("no redemption strategies to configure");
  }

  // configure the funding strategies in the AddressesProvider
  const fundingStrategiesToUpdate: {
    outputToken: string;
    strategyAddress: string;
    strategy: string;
    inputToken: string;
  }[] = [];

  for (const fundingStrategy of chainConfig.fundingStrategies) {
    const { inputToken, strategy, outputToken } = fundingStrategy;
    const fundingStrategyContract = await ethers.getContract(strategy);

    const [onChainStrategyAddress, , onChainInputToken] = await ap.callStatic.getFundingStrategy(inputToken);
    if (onChainStrategyAddress != fundingStrategyContract.address || onChainInputToken != inputToken) {
      fundingStrategiesToUpdate.push({
        outputToken,
        strategyAddress: fundingStrategyContract.address,
        strategy,
        inputToken,
      });
    }
  }

  if (fundingStrategiesToUpdate.length > 0) {
    for (const fundingStrategy of fundingStrategiesToUpdate) {
      const { outputToken, inputToken, strategy, strategyAddress } = fundingStrategy;
      console.log(
        `configuring strategy ${strategy} of type ${strategy} for asset ${outputToken} and input token ${inputToken}`
      );
      const tx = await ap.setFundingStrategy(outputToken, strategyAddress, strategy, inputToken);
      console.log("waiting for ", tx.hash);
      await tx.wait();
      console.log("setFundingStrategy: ", tx.hash);
    }
  } else {
    console.log("no funding strategies to configure");
  }

  // configure the jarvis pools in the AddressesProvider
  {
    const configPools: JarvisLiquidityPool[] = chainConfig.liquidationDefaults.jarvisPools;
    const onChainPools = await ap.callStatic.getJarvisPools();
    for (const key in configPools) {
      const configPool = configPools[key];
      const onChainPool = onChainPools.find((ocp) => ocp.syntheticToken == configPool.syntheticToken);
      if (
        !onChainPool ||
        configPool.liquidityPoolAddress != onChainPool.liquidityPool ||
        configPool.collateralToken != onChainPool.collateralToken ||
        !BigNumber.from(configPool.expirationTime).sub(onChainPool.expirationTime).isZero()
      ) {
        console.log(`updating ${JSON.stringify(onChainPool)} with ${JSON.stringify(configPool)}`);

        const tx = await ap.setJarvisPool(
          configPool.syntheticToken,
          configPool.collateralToken,
          configPool.liquidityPoolAddress,
          configPool.expirationTime
        );

        console.log("waiting for ", tx.hash);
        await tx.wait();
        console.log("jarvis pool configured: ", tx.hash);
      } else {
        console.log(`no need to update jarvis pool config for ${configPool.syntheticToken}`);
      }
    }
    for (const key in onChainPools) {
      const onChainPool = onChainPools[key];
      const configPool = configPools.find((cp) => cp.syntheticToken == onChainPool.syntheticToken);
      if (!configPool) {
        const tx = await ap.setJarvisPool(onChainPool.syntheticToken, constants.AddressZero, constants.AddressZero, 0);
        await tx.wait();
        console.log("jarvis pool removed: ", tx.hash);
      }
    }
  }

  // configure the curve oracles addresses in the AddressesProvider
  const clpov1 = await ethers.getContractOrNull("CurveLpTokenPriceOracleNoRegistry");
  await configureAddress(ap, "CurveLpTokenPriceOracleNoRegistry", clpov1?.address);

  const clpov2 = await ethers.getContractOrNull("CurveV2LpTokenPriceOracleNoRegistry");
  await configureAddress(ap, "CurveV2LpTokenPriceOracleNoRegistry", clpov2?.address);

  // configure the redemption and funding strategies addresses
  const csl = await ethers.getContractOrNull("CurveSwapLiquidator");
  await configureAddress(ap, "CurveSwapLiquidator", csl?.address);

  const jlf = await ethers.getContractOrNull("JarvisLiquidatorFunder");
  await configureAddress(ap, "JarvisLiquidatorFunder", jlf?.address);

  const uv2l = await ethers.getContractOrNull("UniswapV2Liquidator");
  await configureAddress(ap, "UniswapV2Liquidator", uv2l?.address);

  const clptlnr = await ethers.getContractOrNull("CurveLpTokenLiquidatorNoRegistry");
  await configureAddress(ap, "CurveLpTokenLiquidatorNoRegistry", clptlnr?.address);

  await configureAddress(ap, "UNISWAP_V3_ROUTER", chainConfig.chainAddresses.UNISWAP_V3_ROUTER);
  await configureAddress(ap, "ALGEBRA_SWAP_ROUTER", chainConfig.chainAddresses.ALGEBRA_SWAP_ROUTER);
  await configureAddress(ap, "SOLIDLY_SWAP_ROUTER", chainConfig.chainAddresses.SOLIDLY_SWAP_ROUTER);
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
    }
  }
}

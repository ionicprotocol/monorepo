import { arbitrum, bsc, chapel, evmos, fantom, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig, CurveSwapPool, JarvisLiquidityPool } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { FuseSafeLiquidator } from "../../../typechain/FuseSafeLiquidator";
import { LiquidatorConfigFnParams, LiquidatorDeployFnParams } from "../types";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [fantom.chainId]: fantom,
  [evmos.chainId]: evmos,
};

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

  for (const address in chainIdToConfig[chainId].redemptionStrategies) {
    const [redemptionStrategyType] = chainIdToConfig[chainId].redemptionStrategies[address];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
      redemptionStrategy.address
    );
    if (!whitelistedAlready) {
      strategies.push(redemptionStrategy.address);
      arrayOfTrue.push(true);
    }
  }

  for (const address in chainIdToConfig[chainId].fundingStrategies) {
    const [fundingStrategyType] = chainIdToConfig[chainId].fundingStrategies[address];
    const fundingStrategy = await ethers.getContract(fundingStrategyType, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.callStatic.redemptionStrategiesWhitelist(
      fundingStrategy.address
    );
    if (!whitelistedAlready) {
      strategies.push(fundingStrategy.address);
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

  const redemptionStrategiesToUpdate: [string, string, string, string][] = [];
  const ap = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  // configure the redemption strategies in the AddressesProvider
  for (const assetAddress in chainConfig.redemptionStrategies) {
    const [redemptionStrategyType, outputToken]: string[] = chainConfig.redemptionStrategies[assetAddress];
    const [onChainStrategyAddress, onChainContractType, onChainOutputToken] = await ap.callStatic.getRedemptionStrategy(
      assetAddress
    );
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType);
    if (onChainStrategyAddress != redemptionStrategy.address || onChainOutputToken != outputToken) {
      redemptionStrategiesToUpdate.push([
        assetAddress,
        redemptionStrategyType,
        redemptionStrategy.address,
        outputToken,
      ]);
    }
  }

  if (redemptionStrategiesToUpdate.length > 0) {
    for (const key in redemptionStrategiesToUpdate) {
      const [asset, type, strategy, outputToken] = redemptionStrategiesToUpdate[key];
      console.log(
        `configuring strategy ${strategy} of type ${type} for asset ${asset} and output token ${outputToken}`
      );
      const tx = await ap.setRedemptionStrategy(asset, strategy, type, outputToken);
      console.log("waiting for ", tx.hash);
      await tx.wait();
      console.log("setRedemptionStrategy: ", tx.hash);
    }
  } else {
    console.log("no redemption strategies to configure");
  }

  // configure the funding strategies in the AddressesProvider
  const fundingStrategiesToUpdate: [string, string, string, string][] = [];
  for (const assetAddress in chainConfig.fundingStrategies) {
    const [fundingStrategyType, inputToken] = chainConfig.fundingStrategies[assetAddress];
    const fundingStrategy = await ethers.getContract(fundingStrategyType);

    const [onChainStrategyAddress, onChainContractType, onChainInputToken] = await ap.callStatic.getFundingStrategy(
      assetAddress
    );
    if (onChainStrategyAddress != fundingStrategy.address || onChainInputToken != inputToken) {
      fundingStrategiesToUpdate.push([assetAddress, fundingStrategyType, fundingStrategy.address, inputToken]);
    }
  }

  if (fundingStrategiesToUpdate.length > 0) {
    for (const key in fundingStrategiesToUpdate) {
      const [asset, type, strategy, inputToken] = fundingStrategiesToUpdate[key];
      console.log(`configuring strategy ${strategy} of type ${type} for asset ${asset} and input token ${inputToken}`);
      const tx = await ap.setFundingStrategy(asset, strategy, type, inputToken);
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

  // configure the curve swap pools in the AddressesProvider
  {
    const configPools: CurveSwapPool[] = chainConfig.liquidationDefaults.curveSwapPools;
    const curveSwapPools = await ap.callStatic.getCurveSwapPools();
    for (const key in configPools) {
      const configPool = configPools[key];
      const onChainPool = curveSwapPools.find((csp) => csp.poolAddress == configPool.poolAddress);
      if (!onChainPool || configPool.coins.find((c) => onChainPool.coins.indexOf(c) < 0)) {
        const tx = await ap.setCurveSwapPool(configPool.poolAddress, configPool.coins);
        await tx.wait();
        console.log(`curve swap pool configured ${tx.hash}`);
      } else {
        console.log(`no need to update curve swap pool config for ${configPool.poolAddress}`);
      }
    }
    for (const key in curveSwapPools) {
      const onChainPool = curveSwapPools[key];
      const configPool = configPools.find((cp) => cp.poolAddress == onChainPool.poolAddress);
      if (!configPool) {
        const tx = await ap.setCurveSwapPool(onChainPool.poolAddress, []);
        await tx.wait();
        console.log("curve swap pool removed: ", tx.hash);
      }
    }
  }

  const csl = await ethers.getContractOrNull("CurveSwapLiquidator");
  const cslAddress = await ap.callStatic.getAddress("CurveSwapLiquidator");
  if (csl && cslAddress !== csl.address) {
    const tx = await ap.setAddress("CurveSwapLiquidator", csl.address);
    await tx.wait();
    console.log("setAddress CurveSwapLiquidator: ", tx.hash);
  }

  const jlf = await ethers.getContractOrNull("JarvisLiquidatorFunder");
  const jlfAddress = await ap.callStatic.getAddress("JarvisLiquidatorFunder");
  if (jlf && jlfAddress !== jlf.address) {
    const tx = await ap.setAddress("JarvisLiquidatorFunder", jlf.address);
    await tx.wait();
    console.log("setAddress JarvisLiquidatorFunder: ", tx.hash);
  }

  const uv2l = await ethers.getContractOrNull("UniswapV2Liquidator");
  const uv2lAddress = await ap.callStatic.getAddress("UniswapV2Liquidator");
  if (uv2l && uv2lAddress !== uv2l.address) {
    const tx = await ap.setAddress("UniswapV2Liquidator", uv2l.address);
    await tx.wait();
    console.log("setAddress UniswapV2Liquidator: ", tx.hash);
  }

  const clptlnr = await ethers.getContractOrNull("CurveLpTokenLiquidatorNoRegistry");
  const clptlnrAddress = await ap.callStatic.getAddress("CurveLpTokenLiquidatorNoRegistry");
  if (clptlnr && clptlnrAddress !== clptlnr.address) {
    const tx = await ap.setAddress("CurveLpTokenLiquidatorNoRegistry", clptlnr.address);
    await tx.wait();
    console.log("setAddress CurveLpTokenLiquidatorNoRegistry: ", tx.hash);
  }
};

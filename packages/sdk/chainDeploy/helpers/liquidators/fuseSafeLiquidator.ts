import { arbitrum, bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig } from "@midas-capital/types";
import { constants } from "ethers";

import { AddressesProvider } from "../../../lib/contracts/typechain/AddressesProvider";
import { FuseSafeLiquidator } from "../../../lib/contracts/typechain/FuseSafeLiquidator";
import { LiquidatorConfigFnParams, LiquidatorDeployFnParams } from "../types";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
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

    const whitelistedAlready = await fuseSafeLiquidator.redemptionStrategiesWhitelist(redemptionStrategy.address);
    if (!whitelistedAlready) {
      strategies.push(redemptionStrategy.address);
      arrayOfTrue.push(true);
    }
  }

  for (const address in chainIdToConfig[chainId].fundingStrategies) {
    const [fundingStrategyType] = chainIdToConfig[chainId].fundingStrategies[address];
    const fundingStrategy = await ethers.getContract(fundingStrategyType, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.redemptionStrategiesWhitelist(fundingStrategy.address);
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

  const redemptionStrategiesToUpdate: [string, string, string][] = [];
  const ap = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  for (const assetAddress in chainConfig.redemptionStrategies) {
    const [redemptionStrategyType] = chainConfig.redemptionStrategies[assetAddress];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType);

    const [onChainStrategyAddress, onChainContractType] = await ap.redemptionStrategies(assetAddress);
    if (onChainStrategyAddress != redemptionStrategy.address) {
      redemptionStrategiesToUpdate.push([assetAddress, redemptionStrategyType, redemptionStrategy.address]);
    }
  }

  if (redemptionStrategiesToUpdate.length > 0) {
    for (const key in redemptionStrategiesToUpdate) {
      const [asset, type, strategy] = redemptionStrategiesToUpdate[key];
      console.log(`configuring strategy ${strategy} of type ${type} for asset ${asset}`);
      const tx = await ap.setRedemptionStrategy(asset, strategy, type);
      await tx.wait();
      console.log("setRedemptionStrategy: ", tx.hash);
    }
  } else {
    console.log("no redemption strategies to configure");
  }

  const fundingStrategiesToUpdate: [string, string, string][] = [];
  for (const assetAddress in chainConfig.fundingStrategies) {
    const [fundingStrategyType] = chainConfig.fundingStrategies[assetAddress];
    const fundingStrategy = await ethers.getContract(fundingStrategyType);

    const [onChainStrategyAddress, onChainContractType] = await ap.fundingStrategies(assetAddress);
    if (onChainStrategyAddress != fundingStrategy.address) {
      fundingStrategiesToUpdate.push([assetAddress, fundingStrategyType, fundingStrategy.address]);
    }
  }

  if (fundingStrategiesToUpdate.length > 0) {
    for (const key in fundingStrategiesToUpdate) {
      const [asset, type, strategy] = fundingStrategiesToUpdate[key];
      console.log(`configuring strategy ${strategy} of type ${type} for asset ${asset}`);
      const tx = await ap.setFundingStrategy(asset, strategy, type);
      await tx.wait();
      console.log("setFundingStrategy: ", tx.hash);
    }
  } else {
    console.log("no funding strategies to configure");
  }

  for (const key in chainConfig.liquidationDefaults.jarvisPools) {
    const jarvisPool = chainConfig.liquidationDefaults.jarvisPools[key];

    const currenConfig = await ap.jarvisPools(jarvisPool.syntheticToken);

    if (
      currenConfig.collateralToken != jarvisPool.collateralToken ||
      currenConfig.liquidityPool != jarvisPool.liquidityPoolAddress ||
      currenConfig.expirationTime != jarvisPool.expirationTime
    ) {
      const tx = await ap.setJarvisPool(
        jarvisPool.syntheticToken,
        jarvisPool.collateralToken,
        jarvisPool.liquidityPoolAddress,
        jarvisPool.expirationTime
      );

      await tx.wait();
      console.log("jarvis pool configured: ", tx.hash);
    } else {
      console.log(`no need to update jarvis pool config for ${jarvisPool.syntheticToken}`);
    }
  }
};

import { constants } from "ethers";

import { FuseSafeLiquidator } from "../../lib/contracts/typechain";
import { chainRedemptionStrategies } from "../../src/chainConfig";

import { LiquidatorConfigFnParams, LiquidatorDeployFnParams } from "./types";

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
          ],
        },
        onUpgrade: {
          methodName: "_becomeImplementation",
          args: [new ethers.utils.AbiCoder().encode(["address"], [deployer])]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
  });
  if (fsl.transactionHash) await ethers.provider.waitForTransaction(fsl.transactionHash);
  console.log("FuseSafeLiquidator: ", fsl.address);

  const fuseSafeLiquidator = (await ethers.getContract("FuseSafeLiquidator", deployer)) as FuseSafeLiquidator;
  const newOwner = fuseSafeLiquidator.callStatic.owner();
  console.log(`FuseSafeLiquidator owner is ${newOwner}`);
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

  for (const address in chainRedemptionStrategies[chainId]) {
    const redemptionStrategyType = chainRedemptionStrategies[chainId][address];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType, deployer);

    const whitelistedAlready = await fuseSafeLiquidator.redemptionStrategiesWhitelist(redemptionStrategy.address);
    if (!whitelistedAlready) {
      strategies.push(redemptionStrategy.address);
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

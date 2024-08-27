import { zeroAddress, Hash, Address } from "viem";
import { FuseFlywheelDeployFnParams } from "../types";


export const deployFlywheelWithDynamicRewards = async ({
  viem,
  getNamedAccounts,
  deployments,
  deployConfig
}: FuseFlywheelDeployFnParams): Promise<Array<string>> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const dynamicFlywheels = [];

  for (const config of deployConfig.dynamicFlywheels!) {
    if (config) {
      console.log(`Deploying IonicFlywheel & ReplacingFlywheelDynamicRewards for ${config.rewardToken} reward token`);
      const flywheelBooster = await viem.getContractAt(
        "LooplessFlywheelBooster",
        (await deployments.get("LooplessFlywheelBooster")).address as Address
      );
      const flywheelToReplace = config.flywheelToReplace ? config.flywheelToReplace : zeroAddress;

      //// IonicFlywheelCore with Dynamic Rewards
      const fwc = await deployments.deploy(`IonicFlywheel_${config.name}`, {
        contract: "IonicFlywheel",
        from: deployer,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [config.rewardToken, zeroAddress, flywheelBooster.address, deployer]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer
        },
        waitConfirmations: 1
      });
      if (fwc.transactionHash) {
        await publicClient.waitForTransactionReceipt({ hash: fwc.transactionHash as Hash });
      }
      console.log("IonicFlywheel: ", fwc.address);

      const fdr = await deployments.deploy(`ReplacingFlywheelDynamicRewards_${config.name}`, {
        contract: "ReplacingFlywheelDynamicRewards",
        from: deployer,
        args: [flywheelToReplace, fwc.address, config.cycleLength],
        log: true,
        waitConfirmations: 1
      });
      if (fdr.transactionHash) {
        await publicClient.waitForTransactionReceipt({ hash: fdr.transactionHash as Hash });
      }
      console.log("ReplacingFlywheelDynamicRewards: ", fdr.address);

      const flywheelCore = await viem.getContractAt(
        `IonicFlywheel_${config.name}`,
        (await deployments.get(`IonicFlywheel_${config.name}`)).address as Address
      );
      const currentRewards = await flywheelCore.read.flywheelRewards();
      if (currentRewards != fdr.address) {
        const hash = await flywheelCore.write.setFlywheelRewards([fdr.address]);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("setFlywheelRewards: ", hash);
      } else {
        console.log(`rewards contract already set`);
      }

      dynamicFlywheels.push(fwc.address);
    }
  }
  return dynamicFlywheels;
};

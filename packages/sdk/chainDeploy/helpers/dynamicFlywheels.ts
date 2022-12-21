import { constants } from "ethers";

import { FuseFlywheelDeployFnParams } from "..";
import { MidasFlywheel } from "../../lib/contracts/typechain/MidasFlywheel";

export const deployFlywheelWithDynamicRewards = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: FuseFlywheelDeployFnParams): Promise<Array<string>> => {
  const { deployer } = await getNamedAccounts();

  const dynamicFlywheels = [];

  for (const config of deployConfig.dynamicFlywheels) {
    if (config) {
      console.log(
        `Deploying MidasFlywheelCore & FuseFlywheelDynamicRewardsPlugin for ${config.rewardToken} reward token`
      );
      //// MidasFlywheelCore with Dynamic Rewards
      const fwc = await deployments.deploy(`MidasFlywheel_${config.name}`, {
        contract: "MidasFlywheel",
        from: deployer,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [config.rewardToken, constants.AddressZero, constants.AddressZero, deployer],
            },
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer,
        },
        waitConfirmations: 1,
      });
      if (fwc.transactionHash) {
        await ethers.provider.waitForTransaction(fwc.transactionHash);
      }
      console.log("MidasFlywheel: ", fwc.address);

      const fdr = await deployments.deploy(`FuseFlywheelDynamicRewardsPlugin_${config.name}`, {
        contract: "FuseFlywheelDynamicRewardsPlugin",
        from: deployer,
        args: [fwc.address, config.cycleLength],
        log: true,
        waitConfirmations: 1,
      });
      if (fdr.transactionHash) {
        await ethers.provider.waitForTransaction(fdr.transactionHash);
      }
      console.log("FuseFlywheelDynamicRewardsPlugin: ", fdr.address);

      const flywheelCore = (await ethers.getContract(`MidasFlywheel_${config.name}`, deployer)) as MidasFlywheel;
      const currentRewards = await flywheelCore.callStatic.flywheelRewards();
      if (currentRewards != fdr.address) {
        const tx = await flywheelCore.setFlywheelRewards(fdr.address);
        await tx.wait();
        console.log("setFlywheelRewards: ", tx.hash);
      } else {
        console.log(`rewards contract already set`);
      }

      dynamicFlywheels.push(fwc.address);
    }
  }
  return dynamicFlywheels;
};

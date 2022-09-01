import { constants } from "ethers";

import { FuseFlywheelDeployFnParams } from "..";
import { MidasFlywheelCore } from "../../lib/contracts/typechain/MidasFlywheelCore";

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
      const fwc = await deployments.deploy(`MidasFlywheelCore_${config.name}`, {
        contract: "MidasFlywheelCore",
        from: deployer,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [
                config.rewardToken,
                "0x0000000000000000000000000000000000000009", // need to initialize to address that does NOT have balance, otherwise this fails (i.e. AddressZero)
                constants.AddressZero,
                deployer,
              ],
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer,
        },
        waitConfirmations: 1,
      });
      console.log("MidasFlywheelCore: ", fwc.address);

      const fdr = await deployments.deploy(`FuseFlywheelDynamicRewardsPlugin_${config.name}`, {
        contract: "FuseFlywheelDynamicRewardsPlugin",
        from: deployer,
        args: [fwc.address, config.cycleLength],
        log: true,
        waitConfirmations: 1,
      });
      console.log("FuseFlywheelDynamicRewardsPlugin: ", fdr.address);

      const flywheelCore = (await ethers.getContractAt("MidasFlywheelCore", fwc.address, deployer)) as MidasFlywheelCore;
      const tx = await flywheelCore.setFlywheelRewards(fdr.address, { from: deployer });
      await tx.wait();
      console.log("setFlywheelRewards: ", tx.hash);
      dynamicFlywheels.push(fwc.address);
    } else {
      dynamicFlywheels.push(null);
    }
  }
  return dynamicFlywheels;
};

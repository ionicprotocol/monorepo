import { constants } from "ethers";

import { FuseFlywheelDeployFnParams } from "..";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";

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
        `Deploying FuseFlywheelCore & FuseFlywheelDynamicRewardsPlugin for ${config.rewardToken} reward token`
      );
      //// FuseFlywheelCore with Dynamic Rewards
      const fwc = await deployments.deploy(`FuseFlywheelCore_${config.name}`, {
        contract: "FuseFlywheelCore",
        from: deployer,
        args: [
          config.rewardToken,
          "0x0000000000000000000000000000000000000009", // need to initialize to address that does NOT have balance, otherwise this fails (i.e. AddressZero)
          constants.AddressZero,
          deployer,
          constants.AddressZero,
        ],
        log: true,
        waitConfirmations: 1,
      });
      console.log("FuseFlywheelCore: ", fwc.address);

      const fdr = await deployments.deploy(`FuseFlywheelDynamicRewardsPlugin_${config.name}`, {
        contract: "FuseFlywheelDynamicRewardsPlugin",
        from: deployer,
        args: [fwc.address, config.cycleLength],
        log: true,
        waitConfirmations: 1,
      });
      console.log("FuseFlywheelDynamicRewardsPlugin: ", fdr.address);

      const flywheelCore = (await ethers.getContractAt("FuseFlywheelCore", fwc.address, deployer)) as FuseFlywheelCore;
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

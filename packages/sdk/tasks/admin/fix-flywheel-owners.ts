import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { Auth } from "../../typechain/Auth";
import { CErc20PluginDelegate } from "../../typechain/CErc20PluginDelegate";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { MidasERC4626 } from "../../typechain/MidasERC4626";
import { MidasFlywheelCore } from "../../typechain/MidasFlywheelCore";
import { ReplacingFlywheelDynamicRewards } from "../../typechain/ReplacingFlywheelDynamicRewards";
import { ReplacingFlywheelStaticRewards } from "../../typechain/ReplacingFlywheelStaticRewards";
import { Unitroller } from "../../typechain/Unitroller";

export default task("replace-fwr", "Changes the system admin to a new address")
  .addParam("currentDeployer", "The address of the current deployer", undefined, types.string)
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .setAction(async ({ currentDeployer, newDeployer }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(currentDeployer);
    console.log("current deployer", deployer.address);

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
      const admin = await unitroller.callStatic.admin();
      console.log("pool admin", admin);
      console.log("pool comptroller", pool.comptroller);

      const comptrollerAsExtension = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        pool.comptroller,
        deployer
      )) as ComptrollerFirstExtension;
      const flywheels = await comptrollerAsExtension.callStatic.getRewardsDistributors();
      for (let k = 0; k < flywheels.length; k++) {
        const flywheelAddress = flywheels[k];
        {
          const flywheelCore = (await ethers.getContractAt(
            "MidasFlywheelCore",
            flywheelAddress,
            deployer
          )) as MidasFlywheelCore;

          const currentOwner = await flywheelCore.callStatic.owner();
          console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);
          console.log("flywheel rewards address: ", await flywheelCore.callStatic.flywheelRewards());
          const rewards = (await ethers.getContractAt(
            "ReplacingFlywheelDynamicRewards",
            await flywheelCore.callStatic.flywheelRewards(),
            deployer
          )) as ReplacingFlywheelDynamicRewards;

          console.log(rewards.address);
          console.log(`rewards owner: ${await rewards.callStatic.owner()}`);
          const rewardsOwner = await rewards.callStatic.owner();
          if (rewardsOwner == currentDeployer) {
            console.log(`setting rewards owner to ${newDeployer}`);
            tx = await rewards.setAuthority(newDeployer);
            await tx.wait();
            console.log(`rewards.transferOwnership tx mined ${tx.hash}`);
          }
        }
      }
    }
  });

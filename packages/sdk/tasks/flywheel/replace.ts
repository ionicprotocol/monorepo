import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { FuseFlywheelDynamicRewardsPlugin } from "../../typechain/FuseFlywheelDynamicRewardsPlugin";
import { IonicFlywheel } from "../../typechain/IonicFlywheel";
import { IonicReplacingFlywheel } from "../../typechain/IonicReplacingFlywheel";
import { PoolDirectory } from "../../typechain/PoolDirectory";

task("flywheel:replace:dynamic", "Replaces a flywheel with dynamic rewards")
  .addParam("flywheelToReplaceAddress", "address of flywheel to replace", undefined, types.string)
  .addParam("flywheelName", "name of the deploy artifact of the replacing flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async ({ flywheelToReplaceAddress, flywheelName, pool }, { ethers, getChainId, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    if (flywheelToReplaceAddress == "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4") {
      if (flywheelName != "EPX") throw new Error(`name EPX`);
    }
    if (flywheelToReplaceAddress == "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c") {
      if (flywheelName != "DDD") throw new Error(`name DDD`);
    }
    const chainid = await getChainId();
    if (chainid == "56") {
      const flywheelContractName = `IonicFlywheel_${flywheelName}`;

      const flywheelToReplace = (await ethers.getContractAt(
        "IonicFlywheel",
        flywheelToReplaceAddress,
        deployer
      )) as IonicFlywheel;

      const oldRewardsAddress = await flywheelToReplace.callStatic.flywheelRewards();
      const oldRewards = (await ethers.getContractAt(
        "FuseFlywheelDynamicRewardsPlugin",
        oldRewardsAddress,
        deployer
      )) as FuseFlywheelDynamicRewardsPlugin;

      const rewardToken = flywheelToReplace.callStatic.rewardToken();
      const booster = flywheelToReplace.callStatic.flywheelBooster();

      //// deploy a replacing flywheel
      const replacingFw = await deployments.deploy(flywheelContractName, {
        contract: "MidasReplacingFlywheel",
        from: deployer.address,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [rewardToken, constants.AddressZero, booster, deployer.address]
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [flywheelToReplaceAddress]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer.address
        },
        waitConfirmations: 1
      });
      if (replacingFw.transactionHash) {
        await ethers.provider.waitForTransaction(replacingFw.transactionHash);
      }
      console.log("IonicReplacingFlywheel: ", replacingFw.address);

      const replacingFlywheel = (await ethers.getContractAt(
        "IonicReplacingFlywheel",
        replacingFw.address,
        deployer
      )) as IonicReplacingFlywheel;

      let tx = await replacingFlywheel.reinitialize(flywheelToReplaceAddress);
      await tx.wait();
      console.log(`reinitialize`, tx.hash);

      const oldRewardsCycleLen = await oldRewards.callStatic.rewardsCycleLength();

      const replacingRewards = await deployments.deploy("ReplacingFlywheelDynamicRewards", {
        from: deployer.address,
        log: true,
        args: [flywheelToReplaceAddress, replacingFw.address, oldRewardsCycleLen]
      });
      if (replacingRewards.transactionHash) {
        await ethers.provider.waitForTransaction(replacingRewards.transactionHash);
      }
      console.log("ReplacingFlywheelDynamicRewards: ", replacingRewards.address);

      tx = await flywheelToReplace.setFlywheelRewards(replacingRewards.address);
      await tx.wait();
      console.log(`old flywheel setFlywheelRewards`, tx.hash);

      tx = await replacingFlywheel.setFlywheelRewards(replacingRewards.address);
      await tx.wait();
      console.log(`new flywheel setFlywheelRewards`, tx.hash);

      const comptrollerAsExtension = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        pool,
        deployer
      )) as ComptrollerFirstExtension;

      const comptroller = (await ethers.getContractAt("Comptroller", pool, deployer)) as Comptroller;

      tx = await comptroller._addRewardsDistributor(replacingFlywheel.address);
      await tx.wait();
      console.log(`added the flywheel ${tx.hash}`);

      tx = await comptrollerAsExtension.addNonAccruingFlywheel(flywheelToReplaceAddress);
      await tx.wait();
      console.log(`added the flywheel to the non-accruing with tx ${tx.hash}`);
    }
  });

task("flywheels:booster:update").setAction(async ({}, { ethers, getChainId, deployments }) => {
  const deployer = await ethers.getNamedSigner("deployer");

  const fusePoolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;
  const newBooster = await ethers.getContract("LooplessFlywheelBooster", deployer);

  const [ids, poolDatas] = await fusePoolDirectory.callStatic.getActivePools();
  for (const poolData of poolDatas) {
    const pool = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      poolData.comptroller,
      deployer
    )) as ComptrollerFirstExtension;
    const fws = await pool.callStatic.getAccruingFlywheels();

    for (const fw of fws) {
      const flywheel = (await ethers.getContractAt("IonicFlywheel", fw, deployer)) as IonicFlywheel;
      const currentBooster = await flywheel.callStatic.flywheelBooster();
      if (currentBooster != ethers.constants.AddressZero && currentBooster != newBooster.address) {
        const tx = await flywheel.setBooster(newBooster.address);
        await tx.wait();
        console.log(`replaced ${currentBooster} with ${newBooster.address} for ${flywheel.address}`);
      } else {
        console.log(
          `current booster ${currentBooster} NOT REPLACED with ${newBooster.address} for ${flywheel.address}`
        );
      }
    }
  }
});

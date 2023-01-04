import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { ComptrollerFirstExtension } from "../lib/contracts/typechain/ComptrollerFirstExtension";
import { FuseFlywheelDynamicRewardsPlugin } from "../lib/contracts/typechain/FuseFlywheelDynamicRewardsPlugin.sol/FuseFlywheelDynamicRewardsPlugin";
import { MidasFlywheel } from "../lib/contracts/typechain/MidasFlywheel";
import { MidasReplacingFlywheel } from "../lib/contracts/typechain/MidasReplacingFlywheel";
import { DotDotLpERC4626 } from "../lib/contracts/typechain/DotDotLpERC4626.sol";

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
    if (chainid == 56) {
      const flywheelContractName = `MidasFlywheel_${flywheelName}`;

      const flywheelToReplace = (await ethers.getContractAt(
        "MidasFlywheel",
        flywheelToReplaceAddress,
        deployer
      )) as MidasFlywheel;

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
              args: [rewardToken, constants.AddressZero, booster, deployer.address],
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [flywheelToReplaceAddress]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer.address,
        },
        waitConfirmations: 1,
      });
      if (replacingFw.transactionHash) {
        await ethers.provider.waitForTransaction(replacingFw.transactionHash);
      }
      console.log("MidasReplacingFlywheel: ", replacingFw.address);

      const replacingFlywheel = (await ethers.getContractAt(
        "MidasReplacingFlywheel",
        replacingFw.address,
        deployer
      )) as MidasReplacingFlywheel;

      let tx = await replacingFlywheel.reinitialize(flywheelToReplaceAddress);
      await tx.wait();
      console.log(`reinitialize`, tx.hash);

      const oldRewardsCycleLen = await oldRewards.callStatic.rewardsCycleLength();

      const replacingRewards = await deployments.deploy("ReplacingFlywheelDynamicRewards", {
        from: deployer.address,
        log: true,
        args: [flywheelToReplaceAddress, replacingFw.address, oldRewardsCycleLen],
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

task("flywheel:replaced:fix", "fixing the replaced/replacing flywheels and plugins")
.setAction(async ({}, { ethers, deployments, getChainId }) => {
  const deployer = await ethers.getNamedSigner("deployer");

  const chainid = await getChainId();
  if (chainid == 56) {
    const twoBRLMarket = "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba";
    const flywheelDDDName = `MidasFlywheel_DDD`;
    const flywheelEPXName = `MidasFlywheel_EPX`;
    const dotDotPluginContractName = "DotDotLpERC4626_2brl_0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba";
    const poolAddress = "0x31d76A64Bc8BbEffb601fac5884372DEF910F044";
    const toRemoveEPXFlywheel = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
    const toRemoveDDDFlywheel = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";

    let tx;

    // 1 - remove the old flywheels from the pool
    {
      const comptrollerAsExtension = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        poolAddress,
        deployer
      )) as ComptrollerFirstExtension;

      tx = await comptrollerAsExtension._removeFlywheel(toRemoveEPXFlywheel);
      await tx.wait();
      console.log(`remove EPX flywheel with tx ${tx.hash}`);

      tx = await comptrollerAsExtension._removeFlywheel(toRemoveDDDFlywheel);
      await tx.wait();
      console.log(`remove DDD flywheel with tx ${tx.hash}`);
    }

    // 2 - add the 2brl market as strategy for rewards
    const flywheelDDD = await ethers.getContract(flywheelDDDName, deployer) as MidasReplacingFlywheel;
    const flywheelEPX = await ethers.getContract(flywheelEPXName, deployer) as MidasReplacingFlywheel;

    tx = await flywheelDDD.addStrategyForRewards(twoBRLMarket);
    await tx.wait();
    console.log(`DDD add market`, tx.hash);

    tx = await flywheelEPX.addStrategyForRewards(twoBRLMarket);
    await tx.wait();
    console.log(`EPX add market`, tx.hash);

    // 3 - reinitialize the DotDot plugin
    {
      const ddPlugin = await deployments.deploy(dotDotPluginContractName, {
        contract: "DotDotLpERC4626",
        from: deployer.address,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [],
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [flywheelEPX.address, flywheelDDD.address],
            },
          },
          owner: deployer.address,
        },
        log: true,
      });
      if (ddPlugin.transactionHash) {
        await ethers.provider.waitForTransaction(ddPlugin.transactionHash);
      }

      // verify the reinitialize call
      console.log(dotDotPluginContractName, ddPlugin.address);
      const dotDotPlugin = await ethers.getContract(dotDotPluginContractName, deployer) as DotDotLpERC4626;
      const ddEpxFw = await dotDotPlugin.callStatic.epxFlywheel();
      const ddDDDFw = await dotDotPlugin.callStatic.dddFlywheel();

      if (ddEpxFw != flywheelEPX.address || ddDDDFw != flywheelDDD.address) {
        throw new Error(`assert addresses`);
      }
    }
  }
});

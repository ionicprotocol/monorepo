import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../../typechain/ComptrollerFirstExtension";
import { FeeDistributor } from "../../../typechain/FeeDistributor";
import { ICErc20 } from "../../../typechain/ICErc20";
import { PoolDirectory } from "../../../typechain/PoolDirectory";
import { Unitroller } from "../../../typechain/Unitroller";

export default task("comptroller:implementation:set-latest", "Configures a latest comptroller implementation upgrade")
  .addParam("oldImplementation", "The address of the old comptroller implementation", undefined, types.string)
  .addOptionalParam("newImplementation", "The address of the new comptroller implementation", undefined, types.string)
  .setAction(async ({ oldImplementation, newImplementation }, { ethers }) => {
    let tx;
    const deployer = await ethers.getNamedSigner("deployer");
    if (!newImplementation) {
      const currentLatestComptroller = await ethers.getContract("Comptroller");
      newImplementation = currentLatestComptroller.address;
    }
    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;

    const latestComptrollerImplementation = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(
      oldImplementation
    );

    if (
      latestComptrollerImplementation === constants.AddressZero ||
      latestComptrollerImplementation !== newImplementation
    ) {
      console.log(`Setting the latest Comptroller implementation for ${oldImplementation} to ${newImplementation}`);
      tx = await fuseFeeDistributor._setLatestComptrollerImplementation(oldImplementation, newImplementation);
      console.log("_setLatestComptrollerImplementation", tx.hash);
      await tx.wait();
      console.log("latest impl set", tx.hash);
    } else {
      console.log(`No change in the latest Comptroller implementation ${newImplementation}`);
    }
  });

task("pools:all:upgrade", "Upgrades all pools comptroller implementations whose autoimplementatoins are on")
  .addFlag("forceUpgrade", "If the pool upgrade should be forced")
  .setAction(async ({ forceUpgrade }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const fusePoolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;
    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;

    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool", { name: pool.name, address: pool.comptroller });
      const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
      const asComptroller = (await ethers.getContractAt(
        "Comptroller.sol:Comptroller",
        pool.comptroller,
        deployer
      )) as Comptroller;

      const admin = await unitroller.callStatic.admin();
      console.log("pool admin", admin);

      try {
        const implBefore = await unitroller.callStatic.comptrollerImplementation();
        const latestImpl = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(implBefore);
        console.log(`current impl ${implBefore} latest ${latestImpl}`);

        let shouldUpgrade = forceUpgrade || implBefore != latestImpl;
        if (!shouldUpgrade) {
          const comptrollerAsExtension = (await ethers.getContractAt(
            "ComptrollerFirstExtension",
            pool.comptroller,
            deployer
          )) as ComptrollerFirstExtension;
          const markets = await comptrollerAsExtension.callStatic.getAllMarkets();
          for (let j = 0; j < markets.length; j++) {
            const market = markets[j];
            console.log(`market address ${market}`);
            const cTokenInstance = (await ethers.getContractAt("ICErc20", market)) as ICErc20;
            const implBefore = await cTokenInstance.callStatic.implementation();
            console.log(`implementation before ${implBefore}`);
            const [latestImpl] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(implBefore);
            if (latestImpl == constants.AddressZero || latestImpl == implBefore) {
              console.log(`No auto upgrade with latest implementation ${latestImpl}`);
            } else {
              console.log(`will upgrade ${market} to ${latestImpl}`);
              shouldUpgrade = true;
              break;
            }
          }
        }

        if (shouldUpgrade) {
          const tx = await fuseFeeDistributor.autoUpgradePool(pool.comptroller);
          console.log(`bulk upgrading pool with tx ${tx.hash}`);
          await tx.wait();
          console.log(`bulk upgraded pool ${pool.comptroller}`);
        }
      } catch (e) {
        console.error(`error while upgrading the pool ${JSON.stringify(pool)}`, e);
      }
    }
  });

task("pools:all:pause-guardian", "Sets the pause guardian for all pools that have a different address for it")
  .addParam("replacingGuardian", "Address of the replacing pause guardian", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async ({ replacingGuardian, admin }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const fusePoolDirectory = (await ethers.getContract("PoolDirectory", signer)) as PoolDirectory;
    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log(`pool address ${pool.comptroller}`);
      const comptroller = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        pool.comptroller,
        signer
      )) as ComptrollerFirstExtension;
      const pauseGuardian = await comptroller.callStatic.pauseGuardian();
      console.log(`pool name ${pool.name} pause guardian ${pauseGuardian}`);
      if (pauseGuardian != constants.AddressZero && pauseGuardian != replacingGuardian) {
        const error = await comptroller.callStatic._setPauseGuardian(replacingGuardian);
        if (error.isZero()) {
          const tx = await comptroller._setPauseGuardian(replacingGuardian);
          await tx.wait();
          console.log(`set replacing guardian with tx ${tx.hash}`);
        } else {
          console.error(`will fail to set the pause guardian due to error ${error}`);
        }
      }
    }
  });

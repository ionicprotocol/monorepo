import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "@typechain/Comptroller";
import { FuseFeeDistributor } from "@typechain/FuseFeeDistributor";
import { Unitroller } from "@typechain/Unitroller";

task("non-owner-pool:upgrade")
  .addParam("comptrollerAddress", "The comptroller implementation address", undefined, types.string)
  .addParam("poolAddress", "The pool address", undefined, types.string)
  .setAction(async ({ comptrollerAddress, poolAddress }, { ethers, run }) => {
    const signer = await ethers.getNamedSigner("deployer");
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;
    // pools to upgrade
    const pools: string[] = [poolAddress];
    const firstExtension = await ethers.getContract("ComptrollerFirstExtension");

    const comptrollerImpl = (await ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      comptrollerAddress,
      signer
    )) as Comptroller;

    for (let i = 0; i < pools.length; i++) {
      const sliced = pools[i].slice(2);
      const asUnitroller = (await ethers.getContractAt("Unitroller", pools[i], signer)) as Unitroller;
      const asComptroller = (await ethers.getContractAt("Comptroller", pools[i], signer)) as Comptroller;

      const currentImpl = await asUnitroller.callStatic.comptrollerImplementation();
      if (currentImpl != comptrollerImpl.address) {
        console.log(`current impl is ${currentImpl}`);
        const pendingImpl = await asUnitroller.callStatic.pendingComptrollerImplementation();
        console.log(`current pending ${pendingImpl}`);
        console.log(`should be ${comptrollerImpl.address}`);
        if (pendingImpl != comptrollerImpl.address) {
          // asUnitroller._setPendingImplementation(comptrollerImpl.address); // e992a041
          const tx = await fuseFeeDistributor["_callPool(address[],bytes[])"](
            [pools[i]],
            [`0xe992a041000000000000000000000000${comptrollerImpl.address.slice(2)}`]
          );
          await tx.wait();
          console.log(`_setPendingImplementation with tx ${tx.hash}`);
        } else {
          console.log(`pending impl is already ${comptrollerImpl.address}`);
        }

        const currentPending = await asUnitroller.pendingComptrollerImplementation();

        console.log(`new pending ${currentPending}`);

        console.log(`becoming the new impl`);
        // asUnitroller._become(poolAddress)
        const tx = await fuseFeeDistributor["_callPool(address[],bytes[])"](
          [comptrollerImpl.address],
          [`0x1d504dc6000000000000000000000000${sliced}`]
        );
        await tx.wait();
        console.log(`become with ${tx.hash}`);
      } else {
        console.log(`already the needed impl ${currentImpl}`);
      }

      // const autoOn = await asComptroller.callStatic.autoImplementation();
      // if (!autoOn) {
      //   const toggleOnTx = {
      //     to: fuseFeeDistributor.address,
      //     data: `0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${sliced}0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000`,
      //   };
      //
      //   let tx = await signer.sendTransaction(toggleOnTx);
      //   await tx.wait();
      //   console.log(`toggled on with ${tx.hash}`);
      // } else {
      //   console.log(`auto impl is on for ${pools[i]}`);
      // }

      const extensions = await asComptroller.callStatic._listExtensions();
      if (!extensions.length) {
        console.log(`pool ${pools[i]} needs to register the first extension ${firstExtension.address}`);
        // asComptroller._registerExtension(extToAdd, extToReplace)
        const tx = await fuseFeeDistributor["_callPool(address[],bytes[])"](
          [pools[i]],
          [
            `0x89cd9855000000000000000000000000${firstExtension.address.slice(
              2
            )}000000000000000000000000${constants.AddressZero.slice(2)}`,
          ]
        );
        await tx.wait();
        console.log(`_registerExtension with tx ${tx.hash}`);
      } else {
        console.log(`already has extensions ${extensions}`);
      }
    }
  });

task("non-owner-pool:toggle-autoimpl")
  .addParam("poolAddress", "The pool address", undefined, types.string)
  .addParam("enable", "If autoimpl should be enabled", false, types.boolean)
  .setAction(async ({ poolAddress, enable }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;
    const sliced = poolAddress.slice(2);
    const comptroller = (await ethers.getContractAt("Comptroller", poolAddress, signer)) as Comptroller;

    const admin = await comptroller.callStatic.admin();
    console.log("pool admin", admin);

    let tx;
    const isAutOn = await comptroller.autoImplementation();
    if (!isAutOn && enable) {
      const toggleOnTx = {
        to: fuseFeeDistributor.address,
        data: `0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${sliced}0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000`,
      };

      tx = await signer.sendTransaction(toggleOnTx);
      await tx.wait();
      console.log(`toggled on with ${tx.hash}`);
    } else if (isAutOn && !enable) {
      const toggleOffTx = {
        to: fuseFeeDistributor.address,
        data: `0xb01b86fd000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${sliced}0000000000000000000000000000000000000000000000000000000000000024d5333166000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`,
      };

      tx = await signer.sendTransaction(toggleOffTx);
      await tx.wait();
      console.log(`toggled off with ${tx.hash}`);
    } else {
      console.log(`auto impl is ${isAutOn ? "on" : "off"}`);
    }
  });

import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { Unitroller } from "../../typechain/Unitroller";

export default task("comptroller:implementation:whitelist", "Whitelists a new comptroller implementation upgrade")
  .addParam("oldImplementation", "The address of the old comptroller implementation", undefined, types.string)
  .addOptionalParam("newImplementation", "The address of the new comptroller implementation", undefined, types.string)
  .addFlag("setLatest", "Set the new implementation as the latest for the autoimplementations")
  .setAction(async ({ oldImplementation, newImplementation, setLatest }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");
    if (!newImplementation) {
      const currentLatestComptroller = await ethers.getContract("Comptroller");
      newImplementation = currentLatestComptroller.address;
    }

    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

    const newComptrollerImplementations = [newImplementation];
    const oldComptrollerImplementations = [oldImplementation];
    const comptrollerArrayOfTrue = [true];

    let tx = await fuseFeeDistributor._editComptrollerImplementationWhitelist(
      oldComptrollerImplementations,
      newComptrollerImplementations,
      comptrollerArrayOfTrue
    );
    await tx.wait();
    console.log("FuseFeeDistributor comptroller whitelist set", tx.hash);

    if (setLatest) {
      const latestComptrollerImplementation = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(
        oldImplementation
      );
      if (
        latestComptrollerImplementation === constants.AddressZero ||
        latestComptrollerImplementation !== newImplementation
      ) {
        console.log(`Setting the latest Comptroller implementation for ${oldImplementation} to ${newImplementation}`);
        tx = await fuseFeeDistributor._setLatestComptrollerImplementation(oldImplementation, newImplementation);
        await tx.wait();
        console.log("latest impl set", tx.hash);
      } else {
        console.log(`No change in the latest Comptroller implementation ${newImplementation}`);
      }
    }
  });

task("pools:all:upgrade", "Upgrades all pools comptroller implementations whose autoimplementatoins are on")
  .addOptionalParam(
    "oldFirstExtension",
    "The address of the first comptroller extension to replace",
    constants.AddressZero,
    types.string
  )
  .setAction(async ({ oldFirstExtension }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

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
        if (latestImpl == constants.AddressZero || latestImpl == implBefore) {
          console.log(`No auto upgrade with latest implementation ${latestImpl}`);
        } else {
          if (admin == deployer.address) {
            {
              let tx = await unitroller._setPendingImplementation(latestImpl);
              await tx.wait();
              console.log(`set pending impl to ${latestImpl} for ${pool.comptroller} with ${tx.hash}`);

              const comptroller = (await ethers.getContractAt(
                "Comptroller.sol:Comptroller",
                latestImpl,
                deployer
              )) as Comptroller;
              tx = await comptroller._become(unitroller.address);
              await tx.wait();
              console.log(`upgraded to ${latestImpl} pool ${pool.comptroller} with tx ${tx.hash}`);
            }
          } else {
            const autoImplOn = await asComptroller.callStatic.autoImplementation();
            if (!autoImplOn) {
              console.log(`cannot upgrade ${pool.comptroller} , AUTO IMPL is off`);
              continue;
            }

            console.log(`Making an empty call to upgrade ${pool.comptroller} from ${implBefore} to ${latestImpl}`);
            const tx = await asComptroller.enterMarkets([]);
            await tx.wait();
            const implAfter = await asComptroller.callStatic.comptrollerImplementation();
            console.log(`Comptroller implementation after ${implAfter}`);
          }
        }

        // check the extensions if the latest impl
        const implAfter = await unitroller.callStatic.comptrollerImplementation();
        if (implAfter == latestImpl) {
          const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(latestImpl);
          const currentExtensions = await asComptroller.callStatic._listExtensions();
          let different = false;
          for (let j = 0; j < currentExtensions.length; j++) {
            let found = false;
            for (let k = 0; k < comptrollerExtensions.length; k++) {
              if (currentExtensions[j] == comptrollerExtensions[k]) {
                found = true;
                break;
              }
            }
            if (!found) {
              different = true;
              break;
            }
          }

          if (different) {
            if (currentExtensions.length > 1)
              throw new Error(`implement fn to remove extensions for ${pool.comptroller}`);
            console.log(
              `replacing extension ${currentExtensions[0]} with ${comptrollerExtensions[0]} for pool ${pool.comptroller}`
            );
            const tx = await fuseFeeDistributor._registerComptrollerExtension(
              pool.comptroller,
              comptrollerExtensions[0],
              currentExtensions[0]
            );
            await tx.wait();
            console.log(`replaced the first extension for pool ${pool.comptroller} with tx ${tx.hash}`);
          } else {
            console.log(`no need to replace all extensions`);
          }
        } else {
          console.log(`FAILED TO UPGRADE ${pool.comptroller} FROM ${implBefore} TO ${latestImpl}`);
        }
      } catch (e) {
        console.error(`error while upgrading the pool ${JSON.stringify(pool)}`, e);
      }
    }
  });

task("pools:all:autoimpl", "Toggle the autoimplementations flag of all managed pools")
  .addParam("enable", "If autoimplementations should be on or off", true, types.boolean)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async ({ enable, admin }, { ethers }) => {
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const signer = await ethers.getNamedSigner(admin);

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", signer)) as FusePoolDirectory;
    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log(`pool address ${pool.comptroller}`);
      const comptroller = (await new Contract(
        pool.comptroller,
        sdk.chainDeployment.Comptroller.abi,
        signer
      )) as Comptroller;
      const admin = await comptroller.callStatic.admin();
      console.log(`pool name ${pool.name} admin ${admin}`);

      const autoImplOn = await comptroller.callStatic.autoImplementation();
      if (autoImplOn != enable) {
        if (admin === signer.address) {
          const tx = await comptroller._toggleAutoImplementations(enable);
          const receipt = await tx.wait();
          console.log(`toggled to ${enable} with ${receipt.transactionHash}`);
        } else {
          console.log(`signer is not the admin`);
        }
      } else {
        console.log(`autoimplementations for the pool is ${autoImplOn}`);
      }
    }
  });

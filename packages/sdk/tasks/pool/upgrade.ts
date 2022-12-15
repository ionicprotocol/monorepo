import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";
import { Unitroller } from "../../lib/contracts/typechain/Unitroller";

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
  .setAction(async ({ oldFirstExtension }, { ethers, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

    const pools = await fusePoolDirectory.callStatic.getAllPools();
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
          const firstExtension = await ethers.getContractOrNull("ComptrollerFirstExtension");
          if (firstExtension) {
            const extensions = await asComptroller.callStatic._listExtensions();
            console.log(`current extensions ${extensions}`);

            if (!extensions.find((e) => e == firstExtension.address)) {
              const extensionToReplace = extensions.find((e) => e == oldFirstExtension)
                ? oldFirstExtension
                : constants.AddressZero;

              if (firstExtension.address != extensionToReplace) {
                console.log(`registering ext ${firstExtension.address} replacing ${extensionToReplace}`);
                const tx = await fuseFeeDistributor._registerComptrollerExtension(
                  pool.comptroller,
                  firstExtension.address,
                  extensionToReplace
                );
                await tx.wait();
                console.log(`registered the first extension for pool ${pool.comptroller} with tx ${tx.hash}`);
              } else {
                console.log(`not replacing the same extension`);
              }
            } else {
              console.log(`latest first extension already registered`);
            }
          } else {
            console.log(`no first extension deployed for the comptroller`);
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
    const pools = await fusePoolDirectory.callStatic.getAllPools();
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

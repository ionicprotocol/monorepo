import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { CTokenFirstExtension } from "../../lib/contracts/typechain/CTokenFirstExtension";
import { FuseFeeDistributor } from "../../lib/contracts/typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";

task("market:updatewhitelist", "Updates the markets' implementations whitelist")
  .addOptionalParam(
    "oldDelegate",
    "The old delegate implementation to whitelist for the latest impl",
    undefined,
    types.string
  )
  .addOptionalParam(
    "oldPluginDelegate",
    "The old plugin delegate implementation to whitelist for the latest impl",
    undefined,
    types.string
  )
  .addOptionalParam(
    "oldPluginRewardsDelegate",
    "The old plugin rewards delegate implementation to whitelist for the latest impl",
    undefined,
    types.string
  )
  .addFlag("setLatest", "Set the new implementation as the latest for the autoimplementations")
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");
    const oldErc20Delegate = taskArgs.oldDelegate;
    const oldErc20PluginDelegate = taskArgs.oldPluginDelegate;
    const oldErc20PluginRewardsDelegate = taskArgs.oldPluginRewardsDelegate;
    const setLatest = taskArgs.setLatest;

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;
    const erc20Delegate = await ethers.getContract("CErc20Delegate", signer);
    const erc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate", signer);
    const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", signer);

    const oldImplementations = [constants.AddressZero, constants.AddressZero, constants.AddressZero];
    const newImplementations = [erc20Delegate.address, erc20PluginDelegate.address, erc20PluginRewardsDelegate.address];
    const arrayOfFalse = [false, false, false];
    const arrayOfTrue = [true, true, true];

    if (oldErc20Delegate) {
      oldImplementations.push(oldErc20Delegate);
      newImplementations.push(erc20Delegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginDelegate) {
      oldImplementations.push(oldErc20PluginDelegate);
      newImplementations.push(erc20PluginDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginRewardsDelegate) {
      oldImplementations.push(oldErc20PluginRewardsDelegate);
      newImplementations.push(erc20PluginRewardsDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    const tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfFalse,
      arrayOfTrue
    );

    await tx.wait();
    console.log("_editCErc20DelegateWhitelist with tx:", tx.hash);

    if (setLatest) {
      if (oldErc20Delegate) {
        const tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20Delegate,
          erc20Delegate.address,
          false,
          "0x00"
        );
        await tx.wait();
        console.log("_setLatestCErc20Delegate:", tx.hash);
      }

      if (oldErc20PluginDelegate) {
        const tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20PluginDelegate,
          erc20PluginDelegate.address,
          false,
          "0x00"
        );
        await tx.wait();
        console.log("_setLatestCErc20Delegate (plugin):", tx.hash);
      }

      if (oldErc20PluginRewardsDelegate) {
        const tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20PluginRewardsDelegate,
          erc20PluginRewardsDelegate.address,
          false,
          "0x00"
        );
        await tx.wait();
        console.log("_setLatestCErc20Delegate (plugin rewards):", tx.hash);
      }
    }
  });

task("markets:all:upgrade", "Upgrade all upgradeable markets accross all pools")
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;
    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", signer)) as FusePoolDirectory;
    const pools = await fusePoolDirectory.callStatic.getAllPools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const comptroller = (await ethers.getContractAt(
        "Comptroller.sol:Comptroller",
        pool.comptroller,
        signer
      )) as Comptroller;
      const admin = await comptroller.callStatic.admin();
      console.log("pool admin", admin);

      const autoImplOn = await comptroller.callStatic.autoImplementation();
      if (!autoImplOn) {
        if (admin == signer.address) {
          const tx = await comptroller._toggleAutoImplementations(true);
          await tx.wait();
          console.log(`turned autoimpl on ${tx.hash}`);
        } else {
          console.log(`signer is not the admin ${admin} and cannot turn the autoimpl on`);
          continue;
          }
      }

      const markets = await comptroller.callStatic.getAllMarkets();
      for (let j = 0; j < markets.length; j++) {
        const market = markets[j];
        const cTokenInstance = (await ethers.getContractAt(
          "CTokenFirstExtension",
          market,
          signer
        )) as CTokenFirstExtension;

        console.log("market", {
          cToken: market,
          cTokenName: await cTokenInstance.callStatic.name(),
          cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
        });

        const implBefore = await cTokenInstance.callStatic.implementation();
        console.log(`implementation before ${implBefore}`);
        const [latestImpl] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(implBefore);
        if (latestImpl == constants.AddressZero || latestImpl == implBefore) {
          console.log(`No auto upgrade with latest implementation ${latestImpl}`);
        } else {
          try {
            console.log(`upgrading ${market} to ${latestImpl}`);
            const tx = await cTokenInstance.accrueInterest();
            const receipt: TransactionReceipt = await tx.wait();
            console.log("Autoimplementations upgrade by interacting with the CToken:", receipt.status);

            const implAfter = await cTokenInstance.callStatic.implementation();
            console.log(`implementation after ${implAfter}`);
          } catch (e) {
            console.error(`failed to upgrade market ${market} of pool ${pool.comptroller}`, e);
          }
        }
      }

      if (admin == signer.address) {
        const autoImplOn = await comptroller.callStatic.autoImplementation();
        if (autoImplOn) {
          const tx = await comptroller._toggleAutoImplementations(false);
          await tx.wait();
          console.log(`turned autoimpl off ${tx.hash}`);
        }
      }
    }
  });

task("markets:setlatestimpl", "Sets the latest implementations for the CErc20 Delegates")
  .addOptionalParam("oldDelegate", "The old delegate implementation to replace", undefined, types.string)
  .addOptionalParam("oldPluginDelegate", "The old plugin delegate implementation to replace", undefined, types.string)
  .addOptionalParam(
    "oldPluginRewardsDelegate",
    "The old plugin rewards delegate implementation to replace",
    undefined,
    types.string
  )
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner(taskArgs.admin);
    const oldErc20Delegate = taskArgs.oldDelegate;
    const oldErc20PluginDelegate = taskArgs.oldPluginDelegate;
    const oldErc20PluginRewardsDelegate = taskArgs.oldPluginRewardsDelegate;

    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

    const erc20Del = await ethers.getContract("CErc20Delegate", signer);
    const erc20PluginDel = await ethers.getContract("CErc20PluginDelegate", signer);
    const erc20PluginRewardsDel = await ethers.getContract("CErc20PluginRewardsDelegate", signer);

    const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);

    let tx;

    if (oldErc20Delegate) {
      // CErc20Delegate
      const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(oldErc20Delegate);
      if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Del.address) {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20Delegate,
          erc20Del.address,
          false,
          becomeImplementationData
        );
        await tx.wait();
        console.log(`Set the latest CErc20Delegate implementation from ${latestCErc20Delegate} to ${erc20Del.address}`);
      } else {
        console.log(`No change in the latest CErc20Delegate implementation ${erc20Del.address}`);
      }
    }

    if (oldErc20PluginDelegate) {
      // CErc20PluginDelegate
      const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
        oldErc20PluginDelegate
      );
      if (
        latestCErc20PluginDelegate === constants.AddressZero ||
        latestCErc20PluginDelegate !== erc20PluginDel.address
      ) {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20PluginDelegate,
          erc20PluginDel.address,
          false,
          becomeImplementationData
        );
        await tx.wait();
        console.log(
          `Set the latest CErc20PluginDelegate implementation from ${latestCErc20PluginDelegate} to ${erc20PluginDel.address}`
        );
      } else {
        console.log(`No change in the latest CErc20PluginDelegate implementation ${erc20PluginDel.address}`);
      }
    }

    if (oldErc20PluginRewardsDelegate) {
      // CErc20PluginRewardsDelegate
      const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.latestCErc20Delegate(
        oldErc20PluginRewardsDelegate
      );
      if (
        latestCErc20PluginRewardsDelegate === constants.AddressZero ||
        latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDel.address
      ) {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          oldErc20PluginRewardsDelegate,
          erc20PluginRewardsDel.address,
          false,
          becomeImplementationData
        );
        await tx.wait();
        console.log(
          `Set the latest CErc20PluginRewardsDelegate implementation from ${latestCErc20PluginRewardsDelegate} to ${erc20PluginRewardsDel.address}`
        );
      } else {
        console.log(
          `No change in the latest CErc20PluginRewardsDelegate implementation ${erc20PluginRewardsDel.address}`
        );
      }
    }
  });

import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { FeeDistributor } from "../../typechain/FeeDistributor";
import { PoolDirectory } from "../../typechain/PoolDirectory";

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

    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", signer)) as FeeDistributor;
    const erc20Delegate = await ethers.getContract("CErc20Delegate", signer);
    const erc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate", signer);
    const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", signer);

    const oldImplementations = [constants.AddressZero, constants.AddressZero, constants.AddressZero];
    const newImplementations = [erc20Delegate.address, erc20PluginDelegate.address, erc20PluginRewardsDelegate.address];
    const arrayOfFalse = [false, false, false];
    const arrayOfTrue = [true, true, true];

    if (oldErc20Delegate && oldErc20Delegate != erc20Delegate.address) {
      oldImplementations.push(oldErc20Delegate);
      newImplementations.push(erc20Delegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginDelegate && oldErc20PluginDelegate != erc20PluginDelegate.address) {
      oldImplementations.push(oldErc20PluginDelegate);
      newImplementations.push(erc20PluginDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginRewardsDelegate && oldErc20PluginRewardsDelegate != erc20PluginRewardsDelegate.address) {
      oldImplementations.push(oldErc20PluginRewardsDelegate);
      newImplementations.push(erc20PluginRewardsDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    let tx;
    if (oldImplementations.length) {
      tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
        oldImplementations,
        newImplementations,
        arrayOfFalse,
        arrayOfTrue
      );

      await tx.wait();
      console.log("_editCErc20DelegateWhitelist with tx:", tx.hash);
    } else {
      console.log(`implementations already whitelisted`);
    }

    const cfe = (await ethers.getContract("CTokenFirstExtension")) as CTokenFirstExtension;
    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20Delegate.address);
      if (!exts.length) {
        console.log(`setting the extension for delegate ${erc20Delegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20Delegate.address, [cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for delegate ${erc20Delegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20PluginDelegate.address);
      if (!exts.length) {
        console.log(`setting the extension for plugin delegate ${erc20PluginDelegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginDelegate.address, [cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for plugin delegate ${erc20PluginDelegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20PluginRewardsDelegate.address);
      if (!exts.length) {
        console.log(`setting the extension for plugin rewards delegate ${erc20PluginRewardsDelegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginRewardsDelegate.address, [cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`);
      }
    }

    if (setLatest) {
      const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);
      if (oldErc20Delegate) {
        const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(oldErc20Delegate);
        if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Delegate.address) {
          tx = await fuseFeeDistributor._setLatestCErc20Delegate(
            oldErc20Delegate,
            erc20Delegate.address,
            false,
            "0x00"
          );
          console.log("_setLatestCErc20Delegate:", tx.hash);
          await tx.wait();
        } else {
          console.log(`latest impl for delegate ${erc20Delegate.address} already configured`);
        }
      }

      if (oldErc20PluginDelegate) {
        // CErc20PluginDelegate
        const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
          oldErc20PluginDelegate
        );
        if (
          latestCErc20PluginDelegate === constants.AddressZero ||
          latestCErc20PluginDelegate !== erc20PluginDelegate.address
        ) {
          tx = await fuseFeeDistributor._setLatestCErc20Delegate(
            oldErc20PluginDelegate,
            erc20PluginDelegate.address,
            false,
            becomeImplementationData
          );
          console.log("_setLatestCErc20Delegate (plugin):", tx.hash);
          await tx.wait();
        } else {
          console.log(`latest impl for plugin delegate ${erc20PluginDelegate.address} already configured`);
        }
      }

      if (oldErc20PluginRewardsDelegate) {
        const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
          oldErc20PluginRewardsDelegate
        );
        if (
          latestCErc20PluginRewardsDelegate === constants.AddressZero ||
          latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDelegate.address
        ) {
          tx = await fuseFeeDistributor._setLatestCErc20Delegate(
            oldErc20PluginRewardsDelegate,
            erc20PluginRewardsDelegate.address,
            false,
            becomeImplementationData
          );
          console.log("_setLatestCErc20Delegate (plugin rewards):", tx.hash);
          await tx.wait();
        } else {
          console.log(
            `latest impl for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`
          );
        }
      }
    }
  });

type MarketImpl = {
  address: string;
  implBefore: string;
  latestImpl: string;
};

task("markets:all:upgrade", "Upgrade all upgradeable markets across all pools")
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", signer)) as FeeDistributor;
    const fusePoolDirectory = (await ethers.getContract("PoolDirectory", signer)) as PoolDirectory;
    const [, pools] = await fusePoolDirectory.callStatic.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const comptroller = (await ethers.getContractAt(
        "Comptroller.sol:Comptroller",
        pool.comptroller,
        signer
      )) as Comptroller;
      const comptrollerAsExtension = (await ethers.getContractAt(
        "ComptrollerFirstExtension",
        pool.comptroller,
        signer
      )) as ComptrollerFirstExtension;
      const admin = await comptroller.callStatic.admin();
      console.log("pool admin", admin);

      const markets = await comptrollerAsExtension.callStatic.getAllMarkets();
      const marketsToUpgrade: MarketImpl[] = [];
      for (let j = 0; j < markets.length; j++) {
        const market = markets[j];
        console.log(`market address ${market}`);

        const cTokenInstance = (await ethers.getContractAt("CTokenFirstExtension", market)) as CTokenFirstExtension;
        console.log("market", {
          cTokenName: await cTokenInstance.callStatic.name(),
          cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
        });

        const implBefore = await cTokenInstance.callStatic.implementation();
        console.log(`implementation before ${implBefore}`);
        const [latestImpl] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(implBefore);
        if (latestImpl == constants.AddressZero || latestImpl == implBefore) {
          console.log(`No auto upgrade with latest implementation ${latestImpl}`);
        } else {
          console.log(`will upgrade ${market} to ${latestImpl}`);
          marketsToUpgrade.push({
            address: market,
            implBefore,
            latestImpl,
          });
        }
      }

      if (marketsToUpgrade.length > 0) {
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

        for (let j = 0; j < marketsToUpgrade.length; j++) {
          const market = marketsToUpgrade[j];
          const cTokenInstance = (await ethers.getContractAt(
            "CTokenFirstExtension",
            market.address,
            signer
          )) as CTokenFirstExtension;
          try {
            console.log(`upgrading ${market.address} from ${market.implBefore} to ${market.latestImpl}`);
            const tx = await cTokenInstance.accrueInterest();
            await tx.wait();
            console.log("accrueInterest:", tx.hash);

            const implAfter = await cTokenInstance.callStatic.implementation();
            console.log(`implementation after ${implAfter}`);
          } catch (e) {
            console.error(`failed to upgrade market ${market.address} of pool ${pool.comptroller}`, e);
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

    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", signer)) as FeeDistributor;

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

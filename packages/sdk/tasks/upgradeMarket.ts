import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FuseFeeDistributor } from "../lib/contracts/typechain/FuseFeeDistributor";
import { FusePoolDirectory } from "../lib/contracts/typechain/FusePoolDirectory";

// example
// hardhat market:upgrade --pool-name BOMB --market-id BTCB-BOMB --admin deployer --strategy-code BeefyERC4626_BOMBBTCLP --implementation-address "" --network bsc

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("marketId", "Underlying asset symbol or address", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .addOptionalParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("strategyCode", "If using strategy, pass its code", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const poolName = taskArgs.poolName;
    const marketId = taskArgs.marketId;
    let implementationAddress = taskArgs.implementationAddress;
    const strategyCode = taskArgs.strategyCode;

    const signer = await ethers.getNamedSigner(taskArgs.admin);
    console.log(`signer is ${signer.address}`);

    // @ts-ignoreutils/pool
    const poolModule = await import("../tests/utils/pool");
    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

    const pool = await poolModule.getPoolByName(poolName, sdk);
    const poolData = await poolModule.getPoolByName(pool.name, sdk);
    const assets = poolData.assets;

    const assetConfig = assets.find((a) => a.underlyingToken === marketId || a.underlyingSymbol === marketId);

    if (strategyCode) {
      const market = pool.assets.find((a) => a.underlyingToken == assetConfig.underlyingToken);
      console.log("market", market);

      const cTokenInstance = sdk.getCTokenInstance(market.cToken);
      if (implementationAddress === "") {
        // reuse the current implementation, only update the plugin
        implementationAddress = await cTokenInstance.callStatic.implementation();
      }
      assetConfig.plugin = sdk.chainPlugins[assetConfig.underlyingToken].find((p) => p.strategyCode === strategyCode);

      // console.log(await cTokenInstance.callStatic.fuseAdmin(), "FUSE ADMIN");

      const pluginAddress = assetConfig.plugin.strategyAddress;
      const abiCoder = new ethers.utils.AbiCoder();
      const implementationData = abiCoder.encode(["address"], [pluginAddress]);

      console.log(`Setting implementation to ${implementationAddress} and plugin to ${pluginAddress}`);
      const setImplementationTx = await cTokenInstance._setImplementationSafe(
        implementationAddress,
        false,
        implementationData
      );

      const receipt: TransactionReceipt = await setImplementationTx.wait();
      if (receipt.status != constants.One.toNumber()) {
        throw `Failed set implementation to ${assetConfig.plugin.cTokenContract}`;
      }
      console.log(`Implementation successfully set to ${assetConfig.plugin.cTokenContract}`);
    }
  });

task("market:updatewhitelist", "Updates the markets' implementations whitelist")
  .addOptionalParam("oldDelegate", "The old delegate implementation to whitelist for the latest impl", undefined, types.string)
  .addOptionalParam("oldPluginDelegate", "The old plugin delegate implementation to whitelist for the latest impl", undefined, types.string)
  .addOptionalParam("oldPluginRewardsDelegate", "The old plugin rewards delegate implementation to whitelist for the latest impl", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");
    const oldErc20Delegate = taskArgs.oldDelegate;
    const oldErc20PluginDelegate = taskArgs.oldPluginDelegate;
    const oldErc20PluginRewardsDelegate = taskArgs.oldPluginRewardsDelegate;

    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();
    const fuseFeeDistributor = new ethers.Contract(
      sdk.chainDeployment.FuseFeeDistributor.address,
      sdk.chainDeployment.FuseFeeDistributor.abi,
      signer
    );

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfFalse = [];
    const arrayOfTrue = [];

    if (oldErc20Delegate) {
      oldImplementations.push(oldErc20Delegate);
      newImplementations.push(sdk.chainDeployment.CErc20Delegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginDelegate) {
      oldImplementations.push(oldErc20PluginDelegate);
      newImplementations.push(sdk.chainDeployment.CErc20PluginDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    if (oldErc20PluginRewardsDelegate) {
      oldImplementations.push(oldErc20PluginRewardsDelegate);
      newImplementations.push(sdk.chainDeployment.CErc20PluginRewardsDelegate.address);
      arrayOfFalse.push(false);
      arrayOfTrue.push(true);
    }

    const tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfFalse,
      arrayOfTrue
    );

    const receipt = await tx.wait();
    console.log("Set whitelist for ERC20 Delegate with status:", receipt.status);
  });

task("market:unsupport", "Unsupport a market")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("ctoken", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");
    // @ts-ignoreutils/pool
    const poolModule = await import("../tests/utils/pool");

    const sdk = await fuseModule.getOrCreateFuse();
    const pool = await poolModule.getPoolByName(taskArgs.poolName, sdk);

    const comptroller = await sdk.getComptrollerInstance(pool.comptroller, { from: signer.address });
    const tx = await comptroller._unsupportMarket(taskArgs.ctoken);
    const receipt: TransactionReceipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });

task("markets:all:upgrade", "Upgrade all upgradeable markets accross all pools")
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers, run }) => {
    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");

    const sdk = await fuseModule.getOrCreateFuse();
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const fusePoolDirectory = await ethers.getContract("FusePoolDirectory", signer) as FusePoolDirectory;
    const pools = await fusePoolDirectory.callStatic.getAllPools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const comptroller = (await new Contract(
        pool.comptroller,
        sdk.chainDeployment.Comptroller.abi,
        signer
      )) as Comptroller;
      const admin = await comptroller.callStatic.admin();
      console.log("pool admin", admin);

      const autoImplOn = await comptroller.callStatic.autoImplementation();

      if (autoImplOn) {
        const markets = await comptroller.callStatic.getAllMarkets();
        // console.log("pool assets", assets);
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          const cTokenInstance = sdk.getCTokenInstance(market);

          console.log("market", {
            cToken: market,
            cTokenName: await cTokenInstance.callStatic.name(),
            cTokenNameSymbol: await cTokenInstance.callStatic.symbol(),
          });

          const implBefore = await cTokenInstance.callStatic.implementation();
          console.log(`implementation before ${implBefore}`);

          const tx = await cTokenInstance.accrueInterest();
          const receipt: TransactionReceipt = await tx.wait();
          console.log("Autoimplementations upgrade by interacting with the CToken:", receipt.status);

          const implAfter = await cTokenInstance.callStatic.implementation();
          console.log(`implementation after ${implAfter}`);
        }
      } else {
        console.log(`autoimplementations for the pool is off`);
      }
    }
  });

task("markets:setlatestimpl", "Sets the latest implementations for the CErc20 Delegates")
  .addOptionalParam("oldDelegate", "The old delegate implementation to replace", undefined, types.string)
  .addOptionalParam("oldPluginDelegate", "The old plugin delegate implementation to replace", undefined, types.string)
  .addOptionalParam("oldPluginRewardsDelegate", "The old plugin rewards delegate implementation to replace", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers, run }) => {
    const signer = await ethers.getNamedSigner(taskArgs.admin);
    const oldErc20Delegate = taskArgs.oldDelegate;
    const oldErc20PluginDelegate = taskArgs.oldPluginDelegate;
    const oldErc20PluginRewardsDelegate = taskArgs.oldPluginRewardsDelegate;

    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

    const erc20Del = await ethers.getContract("CErc20Delegate", signer);
    const erc20PluginDel = await ethers.getContract("CErc20PluginDelegate", signer);
    const erc20PluginRewardsDel = await ethers.getContract("CErc20PluginRewardsDelegate", signer);
    const etherDel = await ethers.getContract("CEtherDelegate", signer);

    const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);

    let tx;

    if (oldErc20Delegate) {
      // CErc20Delegate
      const [latestCErc20Delegate] = await fuseFeeDistributor.latestCErc20Delegate(oldErc20Delegate);
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
      const [latestCErc20PluginDelegate] = await fuseFeeDistributor.latestCErc20Delegate(oldErc20PluginDelegate);
      if (latestCErc20PluginDelegate === constants.AddressZero || latestCErc20PluginDelegate !== erc20PluginDel.address) {
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
        console.log(`No change in the latest CErc20PluginRewardsDelegate implementation ${erc20PluginRewardsDel.address}`);
      }
    }
  });

task("plugin:whitelist", "Whitelists a plugin implementation")
  .addParam("oldImplementation", "The old plugin implementation address", undefined, types.string)
  .addParam("newImplementation", "The new plugin implementation address", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the FuseFeeDistributor", "deployer", types.string)
  .setAction(async (taskArgs, { ethers, run }) => {
    const oldPluginImplementation = taskArgs.oldImplementation;
    const newPluginImplementation = taskArgs.newImplementation;
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    const oldImplementations = [];
    const newImplementations = [];
    const arrayOfTrue = [];
    const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", signer)) as FuseFeeDistributor;

    if (oldPluginImplementation) {
      oldImplementations.push(oldPluginImplementation);
      newImplementations.push(newPluginImplementation);
      arrayOfTrue.push(true);

      await fuseFeeDistributor._setLatestPluginImplementation(oldPluginImplementation, newPluginImplementation);
    }

    const tx = await fuseFeeDistributor._editPluginImplementationWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfTrue
    );
    const receipt = await tx.wait();
    console.log("Set whitelist for plugins with status:", receipt.status);
  });

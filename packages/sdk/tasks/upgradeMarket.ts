import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../lib/contracts/typechain";

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
  .addParam("oldImplementationAddress", "The address of the old implementation", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();
    const fuseFeeDistributor = new ethers.Contract(
      sdk.chainDeployment.FuseFeeDistributor.address,
      sdk.chainDeployment.FuseFeeDistributor.abi,
      signer
    );

    const tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
      [
        constants.AddressZero,
        constants.AddressZero,
        constants.AddressZero,
        sdk.chainDeployment.CErc20Delegate.address,
        sdk.chainDeployment.CErc20Delegate.address,
        sdk.chainDeployment.CErc20PluginDelegate.address,
        sdk.chainDeployment.CErc20PluginRewardsDelegate.address,

        taskArgs.oldImplementationAddress,
        taskArgs.oldImplementationAddress,
        taskArgs.oldImplementationAddress,
        taskArgs.oldImplementationAddress,
      ],
      [
        sdk.chainDeployment.CErc20Delegate.address,
        sdk.chainDeployment.CErc20PluginDelegate.address,
        sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
        sdk.chainDeployment.CErc20PluginDelegate.address,
        sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
        sdk.chainDeployment.CErc20PluginDelegate.address,
        sdk.chainDeployment.CErc20PluginRewardsDelegate.address,

        sdk.chainDeployment.CErc20Delegate.address,
        sdk.chainDeployment.CErc20PluginDelegate.address,
        sdk.chainDeployment.CErc20PluginRewardsDelegate.address,
        taskArgs.oldImplementationAddress,
      ],
      [false, false, false, false, false, false, false, false, false, false, false],
      [true, true, true, true, true, true, true, true, true, true, true]
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
    // @ts-ignoreutils/pool
    const poolModule = await import("../tests/utils/pool");

    const sdk = await fuseModule.getOrCreateFuse();
    const signer = await ethers.getNamedSigner(taskArgs.admin);
    const pools = await poolModule.getAllPools(sdk);

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

      if (admin === signer.address) {
        const poolData = await poolModule.getPoolByName(pool.name, sdk);
        const assets = poolData.assets;
        // console.log("pool assets", assets);
        for (let j = 0; j < assets.length; j++) {
          const assetConfig = assets[j];
          console.log("asset config", assetConfig);
          const underlying = assetConfig.underlyingToken;
          const assetPlugins = sdk.chainPlugins[underlying];
          if (assetPlugins && assetPlugins.length) {
            const plugin = assetPlugins[0];
            assetConfig.plugin = assetPlugins[0];
            console.log(
              `hardhat market:upgrade --pool-name ${pool.name} --market-id ${underlying} --admin ${taskArgs.admin} --strategy-code ${plugin.strategyCode} --implementation-address "" --network bsc`
            );
            await run("market:upgrade", {
              poolName: pool.name,
              marketId: underlying,
              admin: taskArgs.admin,
              strategyCode: plugin.strategyCode,
              implementationAddress: "",
            });
          } else {
            console.log(
              `No plugin config for pool/market ${pool.name}/${assetConfig.cToken} with underlying asset ${underlying}`
            );
          }
        }
      } else {
        console.log(`The signing address ${signer.address} is not the current admin of the pool ${admin}`);
      }
    }
  });

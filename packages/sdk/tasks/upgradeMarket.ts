import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants } from "ethers";
import { task, types } from "hardhat/config";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("symbol", "Asset symbol", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .addOptionalParam("newImplementationAddress", "The address of the new implementation", undefined, types.string)
  .addOptionalParam("strategyCode", "If using strategy, pass its code", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const poolName = "BOMB";
    const symbol = "BTCB-BOMB";

    const signer = await ethers.getNamedSigner(taskArgs.admin);
    console.log(signer.address);

    // @ts-ignoreutils/assets
    const assetModule = await import("../tests/utils/assets");
    // @ts-ignoreutils/pool
    const poolModule = await import("../tests/utils/pool");
    // @ts-ignoreutils/fuseSdk
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

    const pool = await poolModule.getPoolByName(poolName, sdk);
    const assets = await assetModule.getAssetsConf(
      pool.comptroller,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers,
      poolName
    );

    const assetConfig = assets.find((a) => a.symbol === symbol);
    console.log(assetConfig);

    if (taskArgs.strategyCode) {
      if (!taskArgs.newImplementationAddress) {
        throw "Must pass newImplementationAddress if using strategyCode";
      }
      assetConfig.plugin = sdk.chainPlugins[assetConfig.underlying].find(
        (p) => p.strategyCode === taskArgs.strategyCode
      );

      const market = pool.assets.find((a) => a.underlyingToken == assetConfig.underlying);
      console.log(market);

      const cTokenInstance = sdk.getCTokenInstance(market.cToken);
      console.log(await cTokenInstance.callStatic.fuseAdmin(), "FUSE ADMIN");

      const abiCoder = new ethers.utils.AbiCoder();
      const implementationData = abiCoder.encode(["address"], [assetConfig.plugin.strategyAddress]);
      console.log(`Setting implementation to ${taskArgs.newImplementationAddress}`);
      const setImplementationTx = await cTokenInstance._setImplementationSafe(
        taskArgs.newImplementationAddress,
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

task("market:updatewhitelist", "Upgrades a market's implementation")
  .addParam("oldImplementationAddress", "The address of the new implementation", undefined, types.string)
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
      ],
      [false, false, false, false, false, false, false, false, false, false],
      [true, true, true, true, true, true, true, true, true, true]
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
    const receipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });

import { chainIdtoChain } from "@ionicprotocol/chains";
import { task, types } from "hardhat/config";
import { Address, Hash, zeroAddress } from "viem";

export default task("comptroller:implementation:set-latest", "Configures a latest comptroller implementation upgrade")
  .addParam("oldImplementation", "The address of the old comptroller implementation", undefined, types.string)
  .addOptionalParam("newImplementation", "The address of the new comptroller implementation", undefined, types.string)
  .setAction(async ({ oldImplementation, newImplementation }, { viem, deployments }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();
    if (!newImplementation) {
      const currentLatestComptroller = await viem.getContractAt(
        "Comptroller",
        (await deployments.get("Comptroller")).address as Address
      );
      newImplementation = currentLatestComptroller.address;
    }
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );

    const latestComptrollerImplementation = await feeDistributor.read.latestComptrollerImplementation([
      oldImplementation
    ]);

    if (latestComptrollerImplementation === zeroAddress || latestComptrollerImplementation !== newImplementation) {
      console.log(`Setting the latest Comptroller implementation for ${oldImplementation} to ${newImplementation}`);
      tx = await feeDistributor.write._setLatestComptrollerImplementation([oldImplementation, newImplementation]);
      console.log("_setLatestComptrollerImplementation", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("latest impl set", tx);
    } else {
      console.log(`No change in the latest Comptroller implementation ${newImplementation}`);
    }
  });

task("pools:all:upgrade", "Upgrades all pools comptroller implementations whose autoimplementatoins are on")
  .addFlag("forceUpgrade", "If the pool upgrade should be forced")
  .setAction(async ({ forceUpgrade }, { viem, getChainId, deployments, getNamedAccounts }) => {
    const chainId = await getChainId();
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[+chainId] });
    const { deployer } = await getNamedAccounts();
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[+chainId] });

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );

    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool", { name: pool.name, address: pool.comptroller });
      const unitroller = await viem.getContractAt("Unitroller", pool.comptroller, {
        client: { public: publicClient, wallet: walletClient }
      });
      const admin = await unitroller.read.admin();
      console.log("pool admin", admin);

      try {
        const implBefore = await unitroller.read.comptrollerImplementation();
        const latestImpl = await feeDistributor.read.latestComptrollerImplementation([implBefore]);
        console.log(`current impl ${implBefore} latest ${latestImpl}`);

        let shouldUpgrade = forceUpgrade || implBefore != latestImpl;
        if (!shouldUpgrade) {
          const comptrollerAsExtension = await viem.getContractAt("IonicComptroller", pool.comptroller, {
            client: { public: publicClient, wallet: walletClient }
          });
          const markets = await comptrollerAsExtension.read.getAllMarkets();
          for (let j = 0; j < markets.length; j++) {
            const market = markets[j];
            console.log(`market address ${market}`);
            const cTokenInstance = await viem.getContractAt("ICErc20", market, {
              client: { public: publicClient, wallet: walletClient }
            });
            const implBefore = await cTokenInstance.read.implementation();
            console.log(`implementation before ${implBefore}`);
            const [latestImpl] = await feeDistributor.read.latestCErc20Delegate([
              await cTokenInstance.read.delegateType()
            ]);
            if (latestImpl == zeroAddress || latestImpl == implBefore) {
              console.log(`No auto upgrade with latest implementation ${latestImpl}`);
            } else {
              console.log(`will upgrade ${market} to ${latestImpl}`);
              shouldUpgrade = true;
              break;
            }
          }
        }

        if (shouldUpgrade) {
          const tx = await feeDistributor.write.autoUpgradePool([pool.comptroller]);
          console.log(`bulk upgrading pool with tx ${tx}`);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`bulk upgraded pool ${pool.comptroller}`);
        }
      } catch (e) {
        console.error(`error while upgrading the pool ${JSON.stringify(pool)}`, e);
      }
    }
  });

task("pools:all:pause-guardian", "Sets the pause guardian for all pools that have a different address for it")
  .addParam("replacingGuardian", "Address of the replacing pause guardian", undefined, types.string)
  .setAction(async ({ replacingGuardian }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log(`pool address ${pool.comptroller}`);
      const comptroller = await viem.getContractAt("ComptrollerFirstExtension", pool.comptroller);
      const pauseGuardian = await comptroller.read.pauseGuardian();
      console.log(`pool name ${pool.name} pause guardian ${pauseGuardian}`);
      if (pauseGuardian != zeroAddress && pauseGuardian != replacingGuardian) {
        const error = await comptroller.simulate._setPauseGuardian([replacingGuardian]);
        if (error.result === 0n) {
          const tx = await comptroller.write._setPauseGuardian([replacingGuardian]);
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`set replacing guardian with tx ${tx}`);
        } else {
          console.error(`will fail to set the pause guardian due to error ${error}`);
        }
      }
    }
  });

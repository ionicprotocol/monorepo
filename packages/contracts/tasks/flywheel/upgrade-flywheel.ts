import { task } from "hardhat/config";
import { Address } from "viem";

task("flywheel:upgrade-flywheels-to-support-supply-vaults", "Upgrades the flywheel contracts").setAction(
  async ({}, hre) => {
    const viem = hre.viem;
    const deployments = hre.deployments;
    const publicClient = await viem.getPublicClient();
    const { deployer } = await hre.getNamedAccounts();

    const proxyAdmin = await viem.getContractAt("ProxyAdmin", (await deployments.get("ProxyAdmin")).address as Address);

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    const pools = (await poolDirectory.read.getAllPools()) as any[];
    for (const pool of pools) {
      let comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller as Address);
      const flywheels = await comptroller.read.getAccruingFlywheels();
      for (const ionicFlywheelAddress of flywheels) {
        let flywheelContractName = "IonicFlywheel";
        let flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

        const ionicFlywheelBoosterAddress = (await deployments.get("IonicFlywheelSupplyBooster")).address as Address;
        if ((await flywheel.read.flywheelBooster()) == ZERO_ADDRESS) {
          console.log("Supply Flywheel detected, setting booster");
          flywheel.write.setBooster([ionicFlywheelBoosterAddress]);
        } else {
          console.log("Borrow Flywheel detected, skipping booster");

          flywheelContractName = "IonicFlywheelBorrow";
          flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
        }

        const newImplementationReceipt = await deployments.deploy(flywheelContractName, {
          contract: flywheelContractName,
          from: deployer,
          args: [],
          log: true,
          waitConfirmations: 1
        });

        console.log("New IonicFlywheelCore implementation deployed at: ", newImplementationReceipt.address);
        console.log("Upgrading flywheel at: ", ionicFlywheelAddress);

        const flywheelUpgradeTx = await proxyAdmin.write.upgrade([
          ionicFlywheelAddress as Address,
          newImplementationReceipt.address as Address
        ]);

        if (flywheelUpgradeTx) await publicClient.waitForTransactionReceipt({ hash: flywheelUpgradeTx as Address });

        console.log(
          `Proxy at ${ionicFlywheelAddress} successfully upgraded to new implementation at ${newImplementationReceipt.address}`
        );
      }
    }
  }
);


task("flywheel:upgrade-flywheel-lens-to-support-supply-vaults", "Upgrades the flywheel contracts")
  .addParam("deployer", "The deployer address")
  .setAction(async ({ deployer }, hre) => {
    const viem = hre.viem;
    const deployments = hre.deployments;
    const publicClient = await viem.getPublicClient();

    const proxyAdmin = await viem.getContractAt("ProxyAdmin", (await deployments.get("ProxyAdmin")).address as Address);

    // upgrade IonicFlywheelLensRouter
    const ionicFlywheelLensRouterAddress = (await deployments.get("IonicFlywheelLensRouterAddress")).address as Address;

    const newIonicFlywheelLensRouterImplementationReceipt = await deployments.deploy("IonicFlywheelLensRouterAddress", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1
    });

    if (newIonicFlywheelLensRouterImplementationReceipt.transactionHash)
      await publicClient.waitForTransactionReceipt({
        hash: newIonicFlywheelLensRouterImplementationReceipt.transactionHash as Address
      });

    console.log(
      "New IonicFlywheelLensRouter implementation deployed at: ",
      newIonicFlywheelLensRouterImplementationReceipt.address
    );

    const lensUpgradeTx = await proxyAdmin.write.upgrade([
      ionicFlywheelLensRouterAddress,
      newIonicFlywheelLensRouterImplementationReceipt.address as Address
    ]);

    if (lensUpgradeTx) await publicClient.waitForTransactionReceipt({ hash: lensUpgradeTx as Address });

    console.log(
      `Proxy at ${ionicFlywheelLensRouterAddress} successfully upgraded to new implementation at ${newIonicFlywheelLensRouterImplementationReceipt.address}`
    );
  });
import { task } from "hardhat/config";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

task("flywheel:upgrade-flywheels-to-support-supply-vaults", "Upgrades the flywheel contracts").setAction(
  async ({}, hre) => {
    const viem = hre.viem;
    const deployments = hre.deployments;
    const publicClient = await viem.getPublicClient();
    const { deployer } = await hre.getNamedAccounts();

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    // Used as additional security check, because checking if booster is non-zero address won't be sufficinet
    // due to boosters that are going to be set for supply flywheels also
    const opSupplyFlywheels = [
      '0x4D01bb5710F1989b6C2Dde496a5400E7F3b88162',
      '0x6671AfE7c3aBd9Db195b3e58D348166c21405B88',
      '0x05c3e910F7639457f92220605966e7f86A2ef966'
    ];
    const opBorrowFlywheels = ['0x6660174886cb3B26B38E5D4c1324E0BfB361F7CA'];

    const pools = (await poolDirectory.read.getAllPools()) as any[];
    for (const pool of pools) {
      let comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller as Address);
      const flywheels = await comptroller.read.getAccruingFlywheels();
      for (const ionicFlywheelAddress of flywheels) {
        let flywheelContractName = "IonicFlywheel";
        let implementationAddress = (await deployments.get("IonicFlywheel_SupplyVaults")).address;
        let flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
        
        const ionicFlywheelBoosterAddress = (await deployments.get("IonicFlywheelSupplyBooster")).address as Address;
        if ((await flywheel.read.flywheelBooster()) == ZERO_ADDRESS) {
          if (!opSupplyFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(`Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opSupplyFlywheels.join(", ")}.`);
          }
          console.log("Supply Flywheel detected, setting booster");
          flywheel.write.setBooster([ionicFlywheelBoosterAddress]);
        } else {
          if (!opBorrowFlywheels.includes(ionicFlywheelAddress)) {
            throw new Error(`Invalid flwheel: ${ionicFlywheelAddress}. Must be one of ${opBorrowFlywheels.join(", ")}.`);
          }
          console.log("Borrow Flywheel detected, skipping setting booster");

          flywheelContractName = "IonicFlywheelBorrow";
          flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
          implementationAddress = (await deployments.get("IonicFlywheelBorrow_SupplyVaults")).address;
        }

        console.log("Upgrading flywheel at: ", ionicFlywheelAddress);
        const owner = await poolDirectory.read.owner();
        const implementationData = "0x";
        if (owner.toLowerCase() !== deployer.toLowerCase()) {
          await prepareAndLogTransaction({
            contractInstance: flywheel,
            functionName: "_setImplementationSafe",
            inputs: [
              {
                internalType: "address",
                name: "newImplementation",
                type: "address"
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes"
              }
            ],
            args: [implementationAddress, implementationData],
            description: `Set implementation to ${implementationAddress}`
          });
        } else {
          const setImplementationTx = await flywheel.write._setImplementationSafe([
            implementationAddress as Address,
            implementationData
          ]);
          console.log("setImplementationTx: ", setImplementationTx);
    
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: setImplementationTx
          });
    
          if (receipt.status !== "success") {
            throw `Failed set implementation to ${implementationAddress}`;
          }
          console.log(`Implementation successfully set to ${implementationAddress}: ${setImplementationTx}`);
        }
      }
    }
  }
);
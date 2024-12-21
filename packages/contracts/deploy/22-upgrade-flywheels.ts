import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, encodeAbiParameters } from "viem";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const proxyAdmin = await viem.getContractAt("ProxyAdmin", (await deployments.get("ProxyAdmin")).address as Address);

  const ionicFlywheelLensRouter = await viem.getContractAt(
    "IonicFlywheelLensRouter",
    (await deployments.get("IonicFlywheelLensRouter")).address as Address
  );

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );

  const pools = (await poolDirectory.read.getAllPools()) as any[];
  for (const pool of pools) {
    const flywheels: string[] = await pool.getAccruingFlywheels();
    for (const ionicFlywheelAddress of flywheels) {
      // upgrade IonicFlywheels
      let flywheelContractName = "IonicFlywheel";
      let flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

      const ionicFlywheelBoosterAddress = (await deployments.get("IonicFlywheelSupplyBooster")).address as Address;
      if ((await flywheel.read.flywheelBooster()) == ZERO_ADDRESS) {
        // Supply Flywheel
        flywheel.write.setBooster([ionicFlywheelBoosterAddress]);
      } else {
        // Borrow Flywheel
        flywheelContractName = "IonicFlywheelBorrow";
        flywheel = await viem.getContractAt(flywheelContractName, ionicFlywheelAddress as Address);
      }

      const newImplementationReceipt = await deployments.deploy(flywheelContractName, {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1
      });

      if (newImplementationReceipt.transactionHash)
        await publicClient.waitForTransactionReceipt({ hash: newImplementationReceipt.transactionHash as Address });

      console.log("New IonicFlywheelCore implementation deployed at: ", newImplementationReceipt.address);

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
};

func.tags = ["upgrade", "ionic-flywheels-upgrade"];

export default func;

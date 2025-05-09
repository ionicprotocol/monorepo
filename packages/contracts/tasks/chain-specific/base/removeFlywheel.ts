import { task } from "hardhat/config";
import { Address, formatEther, parseEther } from "viem";
import { COMPTROLLER } from ".";

task("market:base:remove-flywheel", "Deploys flywheel and adds rewards").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();

    const flywheels = [];

    const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    for (const flywheel of flywheels) {
      const removeTx = await comptroller.write._removeFlywheel([flywheel as Address]);
      await publicClient.waitForTransactionReceipt({ hash: removeTx });
      console.log({ removeTx });
      console.log("Removed flywheel from comptroller");
    }
    let accruingFlywheels = await comptroller.read.getAccruingFlywheels();
    console.log("Accruing flywheels: ", accruingFlywheels);
  }
);

import { task } from "hardhat/config";
import { Address } from "viem";
import { COMPTROLLER } from ".";

task("market:base:disable-flywheel", "Deploys flywheel and adds rewards").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();

    const flywheel = await viem.getContractAt(
      "IonicFlywheel",
      (await deployments.get("IonicFlywheel_ION_v2")).address as Address
    );

    const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const addTx = await comptroller.write.addNonAccruingFlywheel([flywheel.address]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log({ addTx });
    console.log("Remove IonicFlywheel_ION_v2 from comptroller");
  }
);

import { task } from "hardhat/config";
import { Address, formatEther, parseEther } from "viem";
import { COMPTROLLER_MAIN, COMPTROLLER_NATIVE } from ".";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("market:mode:remove-flywheel", "Deploys flywheel and adds rewards").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const flywheels: Address[] = ["0x91EDAA7fDbBc7a4098ab9BCB03a763EA2526c15f"];

    const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER_MAIN);
    const admin = await comptroller.read.admin();
    for (const flywheel of flywheels) {
      if (admin.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: comptroller,
          functionName: "_removeFlywheel",
          args: [flywheel as Address],
          description: "Remove flywheel from comptroller",
          inputs: [
            {
              internalType: "address",
              name: "flywheel",
              type: "address"
            }
          ]
        });
      } else {
        const removeTx = await comptroller.write._removeFlywheel([flywheel as Address]);
        await publicClient.waitForTransactionReceipt({ hash: removeTx });
        console.log({ removeTx });
        console.log("Removed flywheel from comptroller");
      }
    }
    let accruingFlywheels = await comptroller.read.getAccruingFlywheels();
    console.log("Accruing flywheels: ", accruingFlywheels);
  }
);

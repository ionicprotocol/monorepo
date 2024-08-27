import { task } from "hardhat/config";
import { Address, formatEther, parseEther } from "viem";
import { COMPTROLLER } from ".";

task("market:base:remove-flywheel", "Deploys flywheel and adds rewards").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const flywheel = await viem.getContractAt(
      "IonicFlywheel",
      (await deployments.get("IonicFlywheel_ION_v2")).address as Address
    );

    const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER);
    const addTx = await comptroller.write._removeFlywheel([flywheel.address]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log({ addTx });
    console.log(`Remove IonicFlywheel_ION_v2 ${flywheel.address} from comptroller`);
  }
);

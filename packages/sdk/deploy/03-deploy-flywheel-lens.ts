import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ getNamedAccounts, deployments, ethers }) => {
  console.log("Starting deployment of the IonicFlywheelLensRouter");
  const { deployer } = await getNamedAccounts();

  const fpd = await ethers.getContract("PoolDirectory"); // Address of the PoolDirectory
  try {
    const mflrReceipt = await deployments.deploy("IonicFlywheelLensRouter", {
      from: deployer,
      args: [fpd.address],
      log: true,
      waitConfirmations: 1
    });
    if (mflrReceipt.transactionHash) await ethers.provider.waitForTransaction(mflrReceipt.transactionHash);
    console.log("IonicFlywheelLensRouter deployed at:", mflrReceipt.address);
  } catch (error) {
    console.error("Deployment or interaction failed:", error);
  }
};

func.tags = ["IonicFlywheelLensRouterDeploy"];

export default func;

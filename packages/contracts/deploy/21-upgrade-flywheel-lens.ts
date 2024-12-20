import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, encodeAbiParameters } from "viem";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  
  const proxyAdmin = await viem.getContractAt("ProxyAdmin", (await deployments.get("ProxyAdmin")).address as Address); 

  // upgrade IonicFlywheelLensRouter
  const ionicFlywheelLensRouterAddress = (await deployments.get("IonicFlywheelLensRouterAddress")).address as Address;

  const newIonicFlywheelLensRouterImplementationReceipt = await deployments.deploy("IonicFlywheelLensRouterAddress", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  if (newIonicFlywheelLensRouterImplementationReceipt.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: newIonicFlywheelLensRouterImplementationReceipt.transactionHash as Address });

  console.log("New IonicFlywheelLensRouter implementation deployed at: ", newIonicFlywheelLensRouterImplementationReceipt.address);

  const lensUpgradeTx = await proxyAdmin.write.upgrade([ionicFlywheelLensRouterAddress, newIonicFlywheelLensRouterImplementationReceipt.address]);

  if (lensUpgradeTx)
    await publicClient.waitForTransactionReceipt({ hash: lensUpgradeTx as Address });

  console.log(
    `Proxy at ${ionicFlywheelLensRouterAddress} successfully upgraded to new implementation at ${newIonicFlywheelLensRouterImplementationReceipt.address}`
  );
};

func.tags = ["upgrade", "ionic-flywheel-lens-router-upgrade"];

export default func;

import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, encodeAbiParameters } from "viem";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  // deploy IonicFlywheelSupplyBooster
  const booster = await deployments.deploy("IonicFlywheelSupplyBooster", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (booster.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: booster.transactionHash as Address });
  console.log("IonicFlywheelSupplyBooster deployed at: ", booster.address);
};

func.tags = ["prod", "ionic-flywheel-supply-booster-core"];

export default func;

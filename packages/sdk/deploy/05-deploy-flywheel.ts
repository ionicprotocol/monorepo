import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();

  const fpd = await ethers.getContract("PoolDirectory", deployer);

  const mflrReceipt = await deployments.deploy("IonicFlywheelLensRouter", {
    from: deployer,
    args: [fpd.address],
    log: true,
    waitConfirmations: 1
  });
  if (mflrReceipt.transactionHash) await ethers.provider.waitForTransaction(mflrReceipt.transactionHash);
  console.log("IonicFlywheelLensRouter: ", mflrReceipt.address);

  const booster = await deployments.deploy("LooplessFlywheelBooster", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (booster.transactionHash) await ethers.provider.waitForTransaction(booster.transactionHash);
  console.log("LooplessFlywheelBooster: ", booster.address);
  if (booster.newlyDeployed) await run("flywheels:booster:update");
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;

import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();

  let fpd;
  try {
    fpd = await deployments.deploy("PoolDirectory", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [false, []]
          }
        },
        owner: multisig
      },
      waitConfirmations: 1
    });
    if (fpd.transactionHash) await ethers.provider.waitForTransaction(fpd.transactionHash);
    console.log("PoolDirectory: ", fpd.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["prod", "deply-pool-directory"];

export default func;

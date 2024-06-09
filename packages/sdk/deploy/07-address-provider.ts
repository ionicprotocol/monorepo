import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();

  ////
  //// HELPERS - ADDRESSES PROVIDER
  try {
    await deployments.deploy("AddressesProvider", {
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [deployer]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      },
      waitConfirmations: 1
    });
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["prod", "deploy-ap"];

export default func;

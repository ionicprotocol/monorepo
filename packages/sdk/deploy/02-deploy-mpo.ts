import { DeployFunction } from "hardhat-deploy/types";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

const func: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  await helpers.mine();
  console.log("Starting deployment of the Master Price Oracle");
  const { deployer, multisig } = await getNamedAccounts();

  try {
    const masterPO = await deployments.deploy("MasterPriceOracle", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      }
    });
    console.log("Master Price Oracle deployed at:", masterPO.address);
  } catch (error) {
    console.error("Could not deploy MPO:", error);
  }
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;

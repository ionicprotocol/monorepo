import { DeployFunction } from "hardhat-deploy/types";

import { chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { deployFunc }: { deployFunc: any } = chainDeployConfig[chainId];

  //// CHAIN SPECIFIC DEPLOYMENT
  console.log("Running deployment for chain: ", chainId);
  if (deployFunc) {
    await deployFunc({ run, ethers, getNamedAccounts, deployments });
  }
};

func.tags = ["prod", "chain-deploy"];

export default func;

import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const poolDirectory = await ethers.getContract("PoolDirectory", deployer);
  const pauserDeployment = await deployments.deploy("GlobalPauser", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
    args: [poolDirectory.address]
  });
  console.log("pauserDeployment: ", pauserDeployment.address);
};

func.tags = ["prod", "global-pauser"];

export default func;

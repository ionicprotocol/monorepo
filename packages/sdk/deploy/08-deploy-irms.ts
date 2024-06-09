import { deployIRMs } from "../chainDeploy/helpers";
import { DeployFunction } from "hardhat-deploy/types";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  ///
  //// IRM MODELS
  await deployIRMs({ run, ethers, getNamedAccounts, deployments, deployConfig: chainDeployParams });
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;

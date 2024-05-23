import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { deployIonicLiquidator, configureIonicLiquidator } from "../chainDeploy/helpers/liquidators/ionicLiquidator";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: any } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  let liquidatorContractName;
  liquidatorContractName = await deployIonicLiquidator({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig: chainDeployParams,
    chainId
  });

  await configureIonicLiquidator({
    contractName: liquidatorContractName,
    ethers,
    getNamedAccounts,
    chainId
  });
};

func.tags = ["liquidator-deploy"];

export default func;

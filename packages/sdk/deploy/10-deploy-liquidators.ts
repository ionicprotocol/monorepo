import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import {
  configureIonicLiquidator,
  deployIonicLiquidator,
  deployIonicUniV3Liquidator
} from "../chainDeploy/helpers/liquidators/ionicLiquidator";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  //// Liquidator
  let liquidatorContractName;
  if (chainId !== 34443) {
    liquidatorContractName = await deployIonicLiquidator({
      run,
      ethers,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });
  } else {
    liquidatorContractName = await deployIonicUniV3Liquidator({
      run,
      ethers,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });
  }

  //// Configure Liquidator
  await configureIonicLiquidator({
    contractName: liquidatorContractName,
    ethers,
    getNamedAccounts,
    chainId
  });
};

func.tags = ["prod", "deploy-liquidators"];

export default func;

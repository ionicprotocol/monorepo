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
  let liquidatorContractName: string | undefined;
  if (chainId === 34443) {
    liquidatorContractName = await deployIonicUniV3Liquidator({
      run,
      ethers,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });
  } else if (chainId === 60808) {
    // TODO
  } else {
    liquidatorContractName = await deployIonicLiquidator({
      run,
      ethers,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });
  }

  //// Configure Liquidator
  if (liquidatorContractName) {
    await configureIonicLiquidator({
      contractName: liquidatorContractName,
      ethers,
      getNamedAccounts,
      chainId
    });
  }
};

func.tags = ["prod", "deploy-liquidators"];

export default func;

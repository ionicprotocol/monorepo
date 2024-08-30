import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { configureAddressesProviderAddresses } from "../chainDeploy/helpers/liquidators/ionicLiquidator";

const func: DeployFunction = async ({ viem, getNamedAccounts, getChainId, deployments }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  if (chainId !== 1) {
    await configureAddressesProviderAddresses({
      viem,
      getNamedAccounts,
      chainId,
      deployConfig: chainDeployParams,
      deployments
    });
  }
};

func.tags = ["prod", "configure-ap"];

export default func;

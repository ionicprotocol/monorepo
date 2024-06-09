import { DeployFunction } from "hardhat-deploy/types";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { configureAddressesProviderAddresses } from "../chainDeploy/helpers/liquidators/ionicLiquidator";

const func: DeployFunction = async ({ ethers, getNamedAccounts, getChainId }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  if (chainId !== 1) {
    await configureAddressesProviderAddresses({
      ethers,
      getNamedAccounts,
      chainId,
      deployConfig: chainDeployParams
    });
  }
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;

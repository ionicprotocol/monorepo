import { task } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { configureAddressesProviderAddresses } from "../../chainDeploy/helpers/liquidators/ionicLiquidator";
import { configureLiquidatorsRegistry } from "../../chainDeploy/helpers/liquidators/registry";

export default task(
  "config:strategies",
  "Configure the redemption and funding strategies in the AddressesProvider for testing purposes"
).setAction(async ({}, { ethers, getNamedAccounts, getChainId }) => {
  const chainId = parseInt(await getChainId());
  const { deployer } = await getNamedAccounts();
  console.log(`deployer ${deployer}`);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: CallableFunction } =
    chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  await configureAddressesProviderAddresses({
    ethers,
    getNamedAccounts,
    chainId,
    deployConfig: chainDeployParams,
  });

  //// Configure Liquidators Registry
  await configureLiquidatorsRegistry({
    ethers,
    getNamedAccounts,
    chainId,
  });
});

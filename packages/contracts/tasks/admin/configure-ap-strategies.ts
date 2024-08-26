import { task } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import {
  configureAddressesProviderAddresses,
  configureIonicLiquidator
} from "../../chainDeploy/helpers/liquidators/ionicLiquidator";
import { configureLiquidatorsRegistry } from "../../chainDeploy/helpers/liquidators/registry";

export default task(
  "config:strategies",
  "Configure the redemption and funding strategies in the AddressesProvider for testing purposes"
).setAction(async ({}, { viem, getNamedAccounts, getChainId, deployments }) => {
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
    viem,
    getNamedAccounts,
    chainId,
    deployConfig: chainDeployParams,
    deployments
  });

  //// Configure Liquidators Registry
  await configureLiquidatorsRegistry({
    viem,
    getNamedAccounts,
    chainId,
    deployments
  });
});

task("config:ionic:liquidator").setAction(async ({}, { viem, deployments, getNamedAccounts, getChainId }) => {
  const chainId = parseInt(await getChainId());
  await configureIonicLiquidator({
    contractName: "IonicUniV3Liquidator",
    viem,
    getNamedAccounts,
    chainId,
    deployments
  });
});

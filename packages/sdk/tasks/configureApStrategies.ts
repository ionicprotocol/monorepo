import { task } from "hardhat/config";

import { configureAddressesProviderStrategies } from "../chainDeploy/helpers/liquidators/fuseSafeLiquidator";

export default task("config:strategies", "").setAction(async ({}, { ethers, getNamedAccounts, getChainId }) => {
  const chainId = await getChainId();
  await configureAddressesProviderStrategies({
    ethers,
    getNamedAccounts,
    chainId,
  });
});

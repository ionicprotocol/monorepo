import { task } from "hardhat/config";

import { configureAddressesProviderStrategies } from "../chainDeploy/helpers/liquidators/fuseSafeLiquidator";

export default task(
  "config:strategies",
  "Configure the redemption and funding strategies in the AddressesProvider for testing purposes"
).setAction(async ({}, { ethers, getNamedAccounts, getChainId }) => {
  const chainId = await getChainId();
  await configureAddressesProviderStrategies({
    ethers,
    getNamedAccounts,
    chainId,
  });
});

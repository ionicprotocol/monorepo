import { task } from "hardhat/config";

<<<<<<<< HEAD:packages/sdk/tasks/admin/configureApStrategies.ts
import { configureAddressesProviderStrategies } from "../.././chainDeploy/helpers/liquidators/fuseSafeLiquidator";
========
import { configureAddressesProviderStrategies } from "../../chainDeploy/helpers/liquidators/fuseSafeLiquidator";
>>>>>>>> 18557dbde631f890a79c4c3ef5bc83c68ec5402e:packages/sdk/tasks/admin/configure-ap-strategies.ts

export default task(
  "config:strategies",
  "Configure the redemption and funding strategies in the AddressesProvider for testing purposes"
).setAction(async ({}, { ethers, getNamedAccounts, getChainId }) => {
  const chainId = parseInt(await getChainId());
  await configureAddressesProviderStrategies({
    ethers,
    getNamedAccounts,
    chainId,
  });
});

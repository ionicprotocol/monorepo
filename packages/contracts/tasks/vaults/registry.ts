import { task } from "hardhat/config";
import { Address } from "viem";

export default task("optimized-vaults-registry:upgrade").setAction(async ({}, { deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  
  const ionicFlywheelLensRouterAddress = (await deployments.get("IonicFlywheelLensRouter_SupplyVaults")).address as Address;
  const vaultsRegistry = await deployments.deploy("OptimizedVaultsRegistry", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [ionicFlywheelLensRouterAddress]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer
    },
    waitConfirmations: 1
  });

  console.log(`Deployed the optimized vaults registry at ${vaultsRegistry.address}`);
});

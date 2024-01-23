import { task } from "hardhat/config";

export default task("optimized-vaults-registry:upgrade").setAction(async ({}, { deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const vaultsRegistry = await deployments.deploy("OptimizedVaultsRegistry", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: []
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer
    },
    waitConfirmations: 1
  });

  console.log(`upgraded the optimized vaults registry at ${vaultsRegistry.address}`);
});

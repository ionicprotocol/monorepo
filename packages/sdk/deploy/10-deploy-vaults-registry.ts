import { DeployFunction } from "hardhat-deploy/types";
import { chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  // OPTIMIZED VAULTS
  // Deploy vaults registry
  if (chainId !== 1 && chainId !== 59144) {
    try {
      console.log("Deploying the optimized APR vaults registry");
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
          owner: multisig
        },
        waitConfirmations: 1
      });
      if (vaultsRegistry.transactionHash) await ethers.provider.waitForTransaction(vaultsRegistry.transactionHash);
      console.log("OptimizedVaultsRegistry: ", vaultsRegistry.address);
    } catch (error) {
      console.error("Could not deploy:", error);
    }
  }
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;

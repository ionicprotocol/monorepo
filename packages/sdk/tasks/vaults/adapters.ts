import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedAPRVaultSecondExtension } from "../../typechain/OptimizedAPRVaultSecondExtension";

export default task("optimized-adapters:deploy")
  .addParam("marketAddress", "Address of the market that the adapter will deposit to", undefined, types.string)
  .setAction(async ({ marketAddress }, { ethers, getChainId, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const { config: deployConfig }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

    const registry = await ethers.getContract("OptimizedVaultsRegistry");

    console.log(`Deploying an ERC4626 for market ${marketAddress}`);
    const marketERC4626Deployment = await deployments.deploy(`CompoundMarketERC4626_${marketAddress}`, {
      contract: "CompoundMarketERC4626",
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [marketAddress, deployConfig.blocksPerYear, registry.address],
          },
          onUpgrade: {
            methodName: "reinitialize",
            args: [registry.address],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer,
      },
      waitConfirmations: 1,
    });
    if (marketERC4626Deployment.transactionHash)
      await ethers.provider.waitForTransaction(marketERC4626Deployment.transactionHash);
    console.log("CompoundMarketERC4626: ", marketERC4626Deployment.address);
  });

task("optimized-adapters:propose")
  .addParam("newAdaptersAddresses", "Comma-separated addresses of the adapters to propose", undefined, types.string)
  .addParam("vaultAddress", "Address of the vault to add the adapter to", undefined, types.string)
  .setAction(async ({ newAdaptersAddresses, vaultAddress }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const vaultFirstExt = (await ethers.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultFirstExtension;
    const adapters = newAdaptersAddresses.split(",");

    const tx = await vaultFirstExt.proposeAdapters(adapters, adapters.length);
    console.log(`waiting to mine tx ${tx.hash}`);
    await tx.wait();
    console.log(`proposed adapters ${adapters} to vault ${vaultAddress}`);
  });

task("optimized-adapters:change")
  .addParam("vaultAddress", "Address of the vault to add the adapter to", undefined, types.string)
  .setAction(async ({ vaultAddress }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const vaultSecondExt = (await ethers.getContractAt(
      "OptimizedAPRVaultSecondExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultSecondExtension;

    const tx = await vaultSecondExt.changeAdapters();
    console.log(`waiting to mine tx ${tx.hash}`);
    await tx.wait();
    console.log(`changed the adapters of vault ${vaultAddress}`);
  });

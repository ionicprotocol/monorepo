import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { Address } from "viem";

export default task("optimized-adapters:deploy")
  .addParam("marketAddress", "Address of the market that the adapter will deposit to", undefined, types.string)
  .setAction(async ({ marketAddress }, { getChainId, deployments, getNamedAccounts, viem }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const { config: deployConfig }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

    const registry = await viem.getContractAt(
      "OptimizedVaultsRegistry",
      (await deployments.get("OptimizedVaultsRegistry")).address as Address
    );

    console.log(`Deploying or upgrading the ERC4626 for market ${marketAddress}`);

    const marketERC4626Deployment = await deployments.deploy(`CompoundMarketERC4626_${marketAddress}`, {
      contract: "CompoundMarketERC4626",
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [marketAddress, deployConfig.blocksPerYear, registry.address]
          },
          onUpgrade: {
            methodName: "reinitialize",
            args: [registry.address]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer
      },
      waitConfirmations: 1
    });
    if (marketERC4626Deployment.transactionHash) {
      await publicClient.waitForTransactionReceipt({ hash: marketERC4626Deployment.transactionHash as Address });
    }
    console.log("CompoundMarketERC4626: ", marketERC4626Deployment.address);
  });

task("optimized-adapters:propose")
  .addParam("newAdaptersAddresses", "Comma-separated addresses of the adapters to propose", undefined, types.string)
  .addParam("vaultAddress", "Address of the vault to add the adapter to", undefined, types.string)
  .setAction(async ({ newAdaptersAddresses, vaultAddress }, { viem }) => {
    const vaultFirstExt = (await viem.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vaultAddress
    ));
    const adapters = newAdaptersAddresses.split(",");
    console.log(adapters, adapters.length);
    const tx = await vaultFirstExt.write.proposeAdapters(adapters, adapters.length);
    console.log(`waiting to mine tx ${tx}`);
    console.log(`proposed adapters ${adapters} to vault ${vaultAddress}`);
  });

task("optimized-adapters:change")
  .addParam("vaultAddress", "Address of the vault to add the adapter to", undefined, types.string)
  .setAction(async ({ vaultAddress }, { viem }) => {

    const vaultSecondExt = (await viem.getContractAt(
      "OptimizedAPRVaultSecondExtension",
      vaultAddress
    ));

    const tx = await vaultSecondExt.write.changeAdapters();
    console.log(`waiting to mine tx ${tx}`);
    console.log(`changed the adapters of vault ${vaultAddress}`);
  });

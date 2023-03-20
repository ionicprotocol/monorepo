import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { CErc20 } from "../../typechain/CErc20";
import { CompoundMarketERC4626 } from "../../typechain/CompoundMarketERC4626";
import { IERC20MetadataUpgradeable as IERC20 } from "../../typechain/IERC20MetadataUpgradeable";
import { OptimizedAPRVault } from "../../typechain/OptimizedAPRVault";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";

export default task("optimized-vault:add")
  .addParam("vaultAddress", "Address of the vault to add", undefined, types.string)
  .setAction(async ({ vaultAddress }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const vaultsRegistry = (await ethers.getContract("OptimizedVaultsRegistry", deployer)) as OptimizedVaultsRegistry;

    const willAddTheVault = await vaultsRegistry.callStatic.addVault(vaultAddress);
    if (willAddTheVault) {
      const tx = await vaultsRegistry.addVault(vaultAddress);
      console.log(`waiting to mine tx ${tx.hash}`);
      await tx.wait();
      console.log(`added vault ${vaultAddress} to the registry`);
    } else {
      console.log(`the vault ${vaultAddress} is already added to the registry`);
    }
  });

task("optimized-vault:remove")
  .addParam("vaultAddress", "Address of the vault to remove", undefined, types.string)
  .setAction(async ({ vaultAddress }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const vaultsRegistry = (await ethers.getContract("OptimizedVaultsRegistry", deployer)) as OptimizedVaultsRegistry;

    const willRemoveTheVault = await vaultsRegistry.callStatic.removeVault(vaultAddress);
    if (willRemoveTheVault) {
      const tx = await vaultsRegistry.removeVault(vaultAddress);
      console.log(`waiting to mine tx ${tx.hash}`);
      await tx.wait();
      console.log(`removed vault ${vaultAddress} from the registry`);
    } else {
      console.log(`the vault ${vaultAddress} is already removed from the registry`);
    }
  });

task("optimized-vault:deploy")
  .addParam("assetAddress", "Address of the underlying asset token", undefined, types.string)
  .addParam("adaptersAddresses", "Comma-separated list of the addresses of the adapters", undefined, types.string)
  .setAction(async ({ assetAddress, adaptersAddresses }, { ethers, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const asset = (await ethers.getContractAt("IERC20MetadataUpgradeable", assetAddress)) as IERC20;
    const symbol = await asset.callStatic.symbol();

    const fees = {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0,
    };

    // start with an even allocations distribution
    const adapters = adaptersAddresses.split(",").map((adapterAddress) => {
      return {
        adapter: adapterAddress,
        allocation: constants.WeiPerEther.div(adaptersAddresses.length)
      }
    });

    const optimizedVault = await deployments.deploy(`OptimizedAPRVault_${symbol}_${assetAddress}`, {
      contract: "OptimizedAPRVault",
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [
              assetAddress,
              adapters, // initial adapters
              adapters.length, // adapters count
              fees,
              deployer, // fee recipient
              constants.MaxUint256, // deposit limit
              deployer, // owner
            ],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer,
      },
      waitConfirmations: 1,
    });
    if (optimizedVault.transactionHash) await ethers.provider.waitForTransaction(optimizedVault.transactionHash);
    console.log("OptimizedAPRVault: ", optimizedVault.address);

    await run("optimized-vault:add", {
      vaultAddress: optimizedVault.address,
    });
  });

task("optimized-adapters:deploy")
  .addParam("marketAddress", "Address of the market that the adapter will deposit to", undefined, types.string)
  .setAction(async ({ marketAddress }, { ethers, getChainId, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    const { config: deployConfig }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

    console.log("Deploying market ERC4626");
    const marketERC4626Deployment = await deployments.deploy(`CompoundMarketERC4626_${marketAddress}`, {
      contract: "CompoundMarketERC4626",
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [marketAddress, deployConfig.blocksPerYear],
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
    const vault = (await ethers.getContractAt("OptimizedAPRVault", vaultAddress, deployer)) as OptimizedAPRVault;
    const adapters = newAdaptersAddresses.split(",");

    const tx = await vault.proposeAdapters(adapters, adapters.length);
    console.log(`waiting to mine tx ${tx.hash}`);
    await tx.wait();
    console.log(`proposed adapters ${adapters} to vault ${vaultAddress}`);
  });

task("optimized-adapters:change")
  .addParam("vaultAddress", "Address of the vault to add the adapter to", undefined, types.string)
  .setAction(async ({ vaultAddress }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const vault = (await ethers.getContractAt("OptimizedAPRVault", vaultAddress, deployer)) as OptimizedAPRVault;

    const tx = await vault.changeAdapters();
    console.log(`waiting to mine tx ${tx.hash}`);
    await tx.wait();
    console.log(`changed the adapters of vault ${vaultAddress}`);
  });

task("deploy-optimized:all")
  .addParam("marketsAddresses", "Comma-separated addresses of the markets", undefined, types.string)
  .setAction(async ({ marketsAddresses }, { ethers, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    let asset;
    const markets = marketsAddresses.split(",");
    for (let i = 0; i < markets; i++) {
      const cErc20 = (await ethers.getContractAt("CErc20", markets[i])) as CErc20;
      const marketUnderlying = await cErc20.callStatic.underlying();
      if (!asset) asset = marketUnderlying;
      if (asset != marketUnderlying) throw new Error(`The vault adapters should be for the same underlying`);
    }

    const adapters = [];
    for (let i = 0; i < markets; i++) {
      const marketAddress = markets[i];
      await run("optimized-adapters:deploy", {
        marketAddress,
      });

      const adapter = (await ethers.getContract(
        `CompoundMarketERC4626_${marketAddress}`,
        deployer
      )) as CompoundMarketERC4626;
      adapters.push(adapter.address);
    }

    await run("optimized-vault:deploy", {
      assetAddress: asset,
      adaptersAddresses: adapters.join(","),
    });
  });

task("deploy-optimized:all:chapel")
  .setAction(async ({ }, { ethers, run, getNamedAccounts }) => {
    await run("deploy-optimized:all", {
      marketsAddresses: "0xc436c7848C6144cf04fa241ac8311864F8572ed3,0xddA148e5917A1c2DCfF98139aBBaa41636840830"
    });
  });

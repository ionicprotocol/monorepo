import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { IERC20MetadataUpgradeable as IERC20 } from "../../typechain/IERC20MetadataUpgradeable";
import { OptimizedAPRVaultBase } from "../../typechain/OptimizedAPRVaultBase";
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
    const optimizedVaultDep = await deployments.deploy(`OptimizedAPRVault_${symbol}_${assetAddress}`, {
      contract: "OptimizedAPRVaultBase",
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });
    if (optimizedVaultDep.transactionHash) await ethers.provider.waitForTransaction(optimizedVaultDep.transactionHash);
    console.log("OptimizedAPRVault: ", optimizedVaultDep.address);

    const fees = {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: ethers.utils.parseEther("0.05") // 1e18 == 100%, 5e16 = 5%
    };

    // start with an even allocations distribution
    const adaptersAddressesArray = adaptersAddresses.split(",");
    const adapters = adaptersAddressesArray.map((adapterAddress: string) => {
      return {
        adapter: adapterAddress,
        allocation: constants.WeiPerEther.div(adaptersAddressesArray.length)
      };
    });

    const tenAdapters = adapters.concat(
      new Array(10 - adapters.length).fill({
        adapter: constants.AddressZero,
        allocation: 0
      })
    );
    const flywheelLogic = await deployments.deploy("IonicFlywheel_Implementation", {
      contract: "IonicFlywheel",
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      skipIfAlreadyDeployed: true
    });
    const registry = await ethers.getContract("OptimizedVaultsRegistry");
    const vaultFirstExtDep = await deployments.deploy("OptimizedAPRVaultFirstExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });
    const vaultSecondExtDep = await deployments.deploy("OptimizedAPRVaultSecondExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });
    const initData = new ethers.utils.AbiCoder().encode(
      [
        "address",
        "tuple(address adapter, uint64 allocation)[10]",
        "uint8",
        "tuple(uint64 deposit, uint64 withdrawal, uint64 management, uint64 performance)",
        "address",
        "uint256",
        "address",
        "address"
      ],
      [
        assetAddress,
        tenAdapters, // initial adapters
        adapters.length, // adapters count
        fees,
        deployer, // fee recipient
        constants.MaxUint256, // deposit limit
        registry.address,
        flywheelLogic.address
      ]
    );

    const optimizedVault = (await ethers.getContractAt(
      "OptimizedAPRVaultBase",
      optimizedVaultDep.address,
      deployer
    )) as OptimizedAPRVaultBase;

    const tx = await optimizedVault.initialize([vaultFirstExtDep.address, vaultSecondExtDep.address], initData);
    await tx.wait();
    console.log(`initialized the vault at ${optimizedVault.address}`);

    await run("optimized-vault:add", {
      vaultAddress: optimizedVault.address
    });
  });

task("optimized-vault:upgrade")
  .addParam("vault")
  .setAction(async ({ vault }, { ethers, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const registry = (await ethers.getContract("OptimizedVaultsRegistry")) as OptimizedVaultsRegistry;

    console.log(`redeploying the extensions...`);
    const vaultFirstExtDep = await deployments.deploy("OptimizedAPRVaultFirstExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });
    const vaultSecondExtDep = await deployments.deploy("OptimizedAPRVaultSecondExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });

    console.log(`configuring the latest extensions in the registry...`);
    let tx = await registry.setLatestVaultExtensions(vault, [vaultFirstExtDep.address, vaultSecondExtDep.address]);
    await tx.wait();
    console.log(`configured the latest extensions for vault ${vault}`);

    const optimizedVault = (await ethers.getContractAt(
      "OptimizedAPRVaultBase",
      vault,
      deployer
    )) as OptimizedAPRVaultBase;

    tx = await optimizedVault.upgradeVault();
    await tx.wait();
    console.log(`upgraded the vault at ${vault} to the latest extensions`);
  });

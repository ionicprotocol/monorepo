import { constants } from "ethers";
import { task, types } from "hardhat/config";
import { Address, parseEther, encodeAbiParameters } from "viem";

export default task("optimized-vault:add")
  .addParam("vaultAddress", "Address of the vault to add", undefined, types.string)
  .setAction(async ({ vaultAddress, hre }, { getNamedAccounts }) => {
    const viem = hre.viem;
    const { deployer } = await getNamedAccounts();
    const vaultsRegistry = await viem.getContract("OptimizedVaultsRegistry", deployer);

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
  .setAction(async ({ vaultAddress, hre }, { getNamedAccounts }) => {
    const viem = hre.viem;
    const { deployer } = await getNamedAccounts();
    const vaultsRegistry = await viem.getContract("OptimizedVaultsRegistry", deployer);

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
  .setAction(async ({ assetAddress, adaptersAddresses }, { deployments, run, getNamedAccounts, viem }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const asset = await viem.getContractAt("IERC20MetadataUpgradeable", assetAddress);
    const symbol = await asset.read.symbol();
    const optimizedVaultDep = await deployments.deploy(`OptimizedAPRVault_${symbol}_${assetAddress}`, {
      contract: "OptimizedAPRVaultBase",
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: []
    });
    if (optimizedVaultDep.transactionHash) {
      await publicClient.waitForTransactionReceipt({ hash: optimizedVaultDep.transactionHash as Address });
    }
    console.log("OptimizedAPRVault: ", optimizedVaultDep.address);

    type Fee = { 
      deposit: bigint;
      withdrawal: bigint;
      management: bigint;
      performance: bigint
    };

    const fees: Fee = {
      deposit: BigInt(0),
      withdrawal: BigInt(0),
      management: BigInt(0),
      performance: BigInt(parseEther("0.05").toString()), // Ensure parseEther outputs BigInt
    };

    // start with an even allocations distribution
    const adaptersAddressesArray = adaptersAddresses.split(",");

    let remainder = parseEther("1");
    const adapters = adaptersAddressesArray.map((adapterAddress: string, index: number) => {
      const config = {
        adapter: adapterAddress as Address,
        allocation: parseEther("1") / BigInt(adaptersAddressesArray.length)
      };

      remainder = remainder - config.allocation;

      return config;
    });

    if (remainder > BigInt(0)) {
      adapters[adapters.length - 1].allocation = adapters[adapters.length - 1].allocation + remainder;
    }
    type Adapter = { 
      adapter: Address;
      allocation: bigint 
    };
    const tenAdapters: Adapter[] = adapters.concat(
      new Array(10 - adapters.length).fill({
        adapter: constants.AddressZero,
        allocation: BigInt(0)
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
    const registry = await viem.getContractAt(
      "OptimizedVaultsRegistry",
      (await deployments.get("OptimizedVaultsRegistry")).address as Address
    );
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

    const values: [
      string,
      Adapter[], // Matches "tuple(address adapter, uint64 allocation)[10]"
      number, // Matches "uint8"
      Fee, // Matches "tuple(uint64, ...)"
      string, // Matches "address"
      bigint, // Matches "uint256"
      string, // Matches "address"
      string  // Matches "address"
    ] =  [
      assetAddress as Address,
      tenAdapters, // initial adapters
      tenAdapters.length, // adapters count
      fees,
      deployer as Address, // fee recipient
      0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn, // deposit limit
      registry.address as Address,
      flywheelLogic.address as Address
    ];
    console.log('values generated', values);

    const initData = encodeAbiParameters(
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
      values
    );

    console.log(`initializing with values ${JSON.stringify(values)}`);

    const optimizedVault = await viem.getContractAt("OptimizedAPRVaultBase", optimizedVaultDep.address as Address);
    await optimizedVault.write.initialize([vaultFirstExtDep.address, vaultSecondExtDep.address], initData);
    console.log(`initialized the vault at ${optimizedVault.address}`);

    await run("optimized-vault:add", {
      vaultAddress: optimizedVault.address
    });
  });

task("optimized-vault:upgrade")
  .addParam("vault")
  .setAction(async ({ vault, hre }, { deployments, getNamedAccounts }) => {
    const viem = hre.viem;

    const { deployer } = await getNamedAccounts();

    const registry = (await viem.getContract("OptimizedVaultsRegistry"));

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

    const optimizedVault = (await viem.getContractAt(
      "OptimizedAPRVaultBase",
      vault,
      deployer
    ));

    tx = await optimizedVault.upgradeVault();
    await tx.wait();
    console.log(`upgraded the vault at ${vault} to the latest extensions`);
  });

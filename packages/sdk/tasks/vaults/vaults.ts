import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../../chainDeploy";
import { CErc20 } from "../../typechain/CErc20";
import { CErc20RewardsDelegate } from "../../typechain/CErc20RewardsDelegate";
import { CompoundMarketERC4626 } from "../../typechain/CompoundMarketERC4626";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { IERC20MetadataUpgradeable as IERC20 } from "../../typechain/IERC20MetadataUpgradeable";
import { IERC20Mintable } from "../../typechain/IERC20Mintable";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { MidasFlywheel } from "../../typechain/MidasFlywheel";
import { OptimizedAPRVaultBase } from "../../typechain/OptimizedAPRVaultBase";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedAPRVaultSecondExtension } from "../../typechain/OptimizedAPRVaultSecondExtension";
import { OptimizedVaultsRegistry } from "../../typechain/OptimizedVaultsRegistry";
import { SimplePriceOracle } from "../../typechain/SimplePriceOracle";

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
      args: [],
    });
    if (optimizedVaultDep.transactionHash) await ethers.provider.waitForTransaction(optimizedVaultDep.transactionHash);
    console.log("OptimizedAPRVault: ", optimizedVaultDep.address);

    const fees = {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: ethers.utils.parseEther("0.05"), // 1e18 == 100%, 5e16 = 5%
    };

    // start with an even allocations distribution
    const adaptersAddressesArray = adaptersAddresses.split(",");
    const adapters = adaptersAddressesArray.map((adapterAddress: string) => {
      return {
        adapter: adapterAddress,
        allocation: constants.WeiPerEther.div(adaptersAddressesArray.length),
      };
    });

    const tenAdapters = adapters.concat(
      new Array(10 - adapters.length).fill({
        adapter: constants.AddressZero,
        allocation: 0,
      })
    );
    const flywheelLogic = await deployments.deploy("MidasFlywheel_Implementation", {
      contract: "MidasFlywheel",
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      skipIfAlreadyDeployed: true,
    });
    const registry = await ethers.getContract("OptimizedVaultsRegistry");
    const vaultFirstExtDep = await deployments.deploy("OptimizedAPRVaultFirstExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [],
    });
    const vaultSecondExtDep = await deployments.deploy("OptimizedAPRVaultSecondExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [],
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
        "address",
      ],
      [
        assetAddress,
        tenAdapters, // initial adapters
        adapters.length, // adapters count
        fees,
        deployer, // fee recipient
        constants.MaxUint256, // deposit limit
        registry.address,
        flywheelLogic.address,
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
      vaultAddress: optimizedVault.address,
    });
  });

task("optimized-adapters:deploy")
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
    const vaultFirstExt = (await ethers.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultFirstExtension;

    const tx = await vaultFirstExt.changeAdapters();
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
    for (let i = 0; i < markets.length; i++) {
      const cErc20 = (await ethers.getContractAt("CErc20", markets[i])) as CErc20;
      const marketUnderlying = await cErc20.callStatic.underlying();
      if (!asset) asset = marketUnderlying;
      if (asset != marketUnderlying) throw new Error(`The vault adapters should be for the same underlying`);
    }

    const adapters = [];
    for (let i = 0; i < markets.length; i++) {
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

task("deploy-optimized:all:chapel").setAction(async ({}, { run }) => {
  await run("deploy-optimized:all", {
    marketsAddresses: "0xc436c7848C6144cf04fa241ac8311864F8572ed3,0xddA148e5917A1c2DCfF98139aBBaa41636840830",
  });
});

task("deploy-vault-flywheel")
  .addParam("vaultAddress", "Address of the vault", undefined, types.string)
  .addParam("rewardToken", "Address of the reward token to add a flywheel for", undefined, types.string)
  .setAction(async ({ vaultAddress, rewardToken }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const vaultFirstExt = (await ethers.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultFirstExtension;
    const vaultSecondExt = (await ethers.getContractAt(
      "OptimizedAPRVaultSecondExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultSecondExtension;
    const flywheelForRewardToken = await vaultSecondExt.callStatic.flywheelForRewardToken(rewardToken);
    if (flywheelForRewardToken != constants.AddressZero) {
      console.log(
        `there is already a flywheel ${flywheelForRewardToken} for reward token ${rewardToken} in the vault at ${vaultAddress}`
      );
    } else {
      const tx = await vaultFirstExt.addRewardToken(rewardToken);
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`added a flywheel for reward token ${rewardToken} in the vault at ${vaultAddress}`);
    }
  });

task("deploy-market-with-rewards").setAction(async ({}, { ethers, getChainId, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const chainid = parseInt(await getChainId());
  if (chainid == 97) {
    const mintingAmount = ethers.utils.parseEther("10000000000000");

    const testingBombErc20 = await deployments.deploy("ChapelBombERC20", {
      contract: "ERC20PresetMinterPauserUpgradeable",
      from: deployer,
      skipIfAlreadyDeployed: true,
      log: true,
      waitConfirmations: 1,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: ["Testing Bomb Token", "TBOMB"],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer,
      },
    });
    if (testingBombErc20.transactionHash) await ethers.provider.waitForTransaction(testingBombErc20.transactionHash);
    console.log(`deployed a dummy bomb token at ${testingBombErc20.address}`);
    const bombToken = (await ethers.getContractAt(
      "IERC20Mintable",
      testingBombErc20.address,
      deployer
    )) as IERC20Mintable;

    let tx = await bombToken.mint(deployer, mintingAmount);
    console.log(`mining tx ${tx.hash}`);
    await tx.wait();
    console.log(`minted ${mintingAmount} testing BOMB tokens to the deployer ${deployer}`);

    const rewardsErc20 = await deployments.deploy("ChapelRewardsERC20", {
      contract: "ERC20PresetMinterPauserUpgradeable",
      from: deployer,
      skipIfAlreadyDeployed: true,
      log: true,
      waitConfirmations: 1,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: ["Testing Rewards Token", "TRT"],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer,
      },
    });
    if (rewardsErc20.transactionHash) await ethers.provider.waitForTransaction(rewardsErc20.transactionHash);
    console.log(`deployed a dummy rewards token at ${rewardsErc20.address}`);

    // mint some reward tokens to the deployer
    const rewardsTokenMintable = (await ethers.getContractAt(
      "IERC20Mintable",
      rewardsErc20.address,
      deployer
    )) as IERC20Mintable;
    tx = await rewardsTokenMintable.mint(deployer, mintingAmount.mul(2));
    console.log(`mining tx ${tx.hash}`);
    await tx.wait();
    console.log(`minted ${mintingAmount} tokens to the deployer ${deployer}`);

    const midasPoolAddress = "0x044c436b2f3EF29D30f89c121f9240cf0a08Ca4b";
    const midasPool = (await ethers.getContractAt("Comptroller", midasPoolAddress, deployer)) as Comptroller;
    const midasPoolAsExt = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      midasPoolAddress,
      deployer
    )) as ComptrollerFirstExtension;
    const ffd = await ethers.getContract("FuseFeeDistributor");
    const jrm = await ethers.getContract("JumpRateModel");
    const rewardsDelegate = await ethers.getContract("CErc20RewardsDelegate");
    const spo = (await ethers.getContract("SimplePriceOracle", deployer)) as SimplePriceOracle;
    const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
    tx = await mpo.add([testingBombErc20.address], [spo.address]);
    await tx.wait();
    console.log(`added the SPO to the MPO for the testing BOMB token`);

    tx = await spo.setDirectPrice(testingBombErc20.address, ethers.utils.parseEther("0.0003"));
    await tx.wait();
    console.log(`set a direct price for the testing BOMB token`);

    const constructorData = new ethers.utils.AbiCoder().encode(
      ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
      [
        bombToken.address,
        midasPool.address,
        ffd.address,
        jrm.address,
        "M Testing BOMB",
        "MTB",
        rewardsDelegate.address,
        new ethers.utils.AbiCoder().encode([], []),
        0,
        0,
      ]
    );
    tx = await midasPool._deployMarket(false, constructorData, ethers.utils.parseEther("0.9"));
    console.log(`mining tx ${tx.hash}`);
    await tx.wait();
    console.log(`deployed a testing BOMB market`);

    const allMarkets = await midasPoolAsExt.callStatic.getAllMarkets();
    const newMarketAddress = allMarkets[allMarkets.length - 1];

    const testingBombToken = (await ethers.getContractAt("IERC20", testingBombErc20.address, deployer)) as IERC20;
    tx = await testingBombToken.approve(newMarketAddress, constants.MaxUint256);
    await tx.wait();
    console.log(`approved the new market to pull the underlying testing BOMB tokens`);

    const newMarket = (await ethers.getContractAt(
      "CErc20RewardsDelegate",
      newMarketAddress,
      deployer
    )) as CErc20RewardsDelegate;
    const errCode = await newMarket.callStatic.mint(ethers.utils.parseEther("2"));
    if (!errCode.isZero()) throw new Error(`unable to mint cTokens from the new testing BOMB market`);
    else {
      tx = await newMarket.mint(ethers.utils.parseEther("2"));
      await tx.wait();
      console.log(`minted some cTokens from the testing BOMB market`);
    }

    {
      const flywheelDeployment = await deployments.deploy("ChapelRewardsFlywheel", {
        from: deployer,
        contract: "MidasFlywheel",
        log: true,
        waitConfirmations: 1,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [rewardsErc20.address, constants.AddressZero, constants.AddressZero, deployer],
            },
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: deployer,
        },
      });
      const rewardsDeployment = await deployments.deploy("ChapelRewardsContract", {
        from: deployer,
        contract: "FuseFlywheelDynamicRewards",
        log: true,
        waitConfirmations: 1,
        args: [flywheelDeployment.address, 60 * 10], // new cycle every 10 minutes
      });
      const flywheel = (await ethers.getContractAt(
        "MidasFlywheel",
        flywheelDeployment.address,
        deployer
      )) as MidasFlywheel;
      tx = await flywheel.setFlywheelRewards(rewardsDeployment.address);
      await tx.wait();
      console.log(`configured the flywheel rewards`);

      tx = await newMarket.approve(rewardsErc20.address, rewardsDeployment.address);
      await tx.wait();
      console.log(`approved the rewards contract to pull rewards from the market`);

      tx = await flywheel.addStrategyForRewards(newMarketAddress);
      await tx.wait();
      console.log(`added the testing BOMB market for rewards in the flywheel`);

      tx = await midasPool._addRewardsDistributor(flywheel.address);
      await tx.wait();
      console.log(`added the flywheel to the pool rewards distributors`);
    }

    const rewardsToken = (await ethers.getContractAt("IERC20", rewardsErc20.address, deployer)) as IERC20;
    tx = await rewardsToken.transfer(newMarketAddress, ethers.utils.parseEther("15"));
    await tx.wait();
    console.log(`funded the market with reward tokens`);
  }
});

task("optimized-vault:upgrade")
  .addParam("vault")
  .setAction(async ( { vault }, { ethers, deployments, getNamedAccounts } ) => {
    const { deployer } = await getNamedAccounts();

    const registry = await ethers.getContract("OptimizedVaultsRegistry") as OptimizedVaultsRegistry;

    console.log(`redeploying the extensions...`);
    const vaultFirstExtDep = await deployments.deploy("OptimizedAPRVaultFirstExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [],
    });
    const vaultSecondExtDep = await deployments.deploy("OptimizedAPRVaultSecondExtension", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      args: [],
    });

    console.log(`configuring the latest extensions in the registry...`);
    let tx = await registry.setLatestVaultExtensions(vault, [vaultFirstExtDep.address, vaultSecondExtDep.address]);
    await tx.wait();
    console.log(`configured the latest extensions for vault ${vault}`);

    const vaultAsFirstExt = (await ethers.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vault,
      deployer
    )) as OptimizedAPRVaultFirstExtension;

    tx = await vaultAsFirstExt.upgradeVault();
    await tx.wait();
    console.log(`upgraded the vault at ${vault} to the latest extensions`);
  });

task("optimized-vaults-registry:upgrade")
  .setAction(async ( {}, { deployments, getNamedAccounts } ) => {
    const { deployer } = await getNamedAccounts();
    const vaultsRegistry = await deployments.deploy("OptimizedVaultsRegistry", {
      from: deployer,
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer,
      },
      waitConfirmations: 1,
    });

    console.log(`upgraded the optimized vaults registry at ${vaultsRegistry.address}`);
  });

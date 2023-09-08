import { constants, providers, utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { deployIRMs } from "../chainDeploy/helpers";
import { getCgPrice } from "../chainDeploy/helpers/getCgPrice";
import {
  configureAddressesProviderAddresses,
  configureIonicLiquidator,
  deployIonicLiquidator
} from "../chainDeploy/helpers/liquidators/ionicLiquidator";
import { configureLiquidatorsRegistry } from "../chainDeploy/helpers/liquidators/registry";
import { AddressesProvider } from "../typechain/AddressesProvider";
import { AuthoritiesRegistry } from "../typechain/AuthoritiesRegistry";
import { FeeDistributor } from "../typechain/FeeDistributor";
import { LeveredPositionFactory } from "../typechain/LeveredPositionFactory";
import { LiquidatorsRegistry } from "../typechain/LiquidatorsRegistry";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);
  const MIN_BORROW_USD = chainId === 97 || chainId == 245022934 ? 0.1 : 100;
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("balance: ", balance.toString());
  const price = await ethers.provider.getGasPrice();
  console.log("gas price: ", ethers.utils.formatUnits(price, "gwei"));

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams, deployFunc }: { config: ChainDeployConfig; deployFunc: any } =
    chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const cgPrice = await getCgPrice(chainDeployParams.cgId);
  const minBorrow = utils.parseUnits((MIN_BORROW_USD / cgPrice).toFixed(18));

  ////
  //// COMPOUND CORE CONTRACTS
  let tx: providers.TransactionResponse;

  const ffd = await deployments.deploy("FeeDistributor", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [ethers.utils.parseEther("0.1")]
        }
      },
      owner: deployer
    }
  });
  if (ffd.transactionHash) await ethers.provider.waitForTransaction(ffd.transactionHash);

  console.log("FeeDistributor: ", ffd.address);
  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;

  const ffdFee = await fuseFeeDistributor.callStatic.defaultInterestFeeRate();
  console.log(`ffd fee ${ffdFee}`);
  if (ffdFee.isZero()) {
    tx = await fuseFeeDistributor._setDefaultInterestFeeRate(ethers.utils.parseEther("0.1"));
    await tx.wait();
    console.log(`updated the FFD fee with tx ${tx.hash}`);

    const feeAfter = await fuseFeeDistributor.callStatic.defaultInterestFeeRate();
    console.log(`ffd fee updated to ${feeAfter}`);
  } else {
    console.log(`not updating the ffd fee`);
  }

  try {
    const currentMinBorrow = await fuseFeeDistributor.callStatic.minBorrowEth();
    const currentMinBorrowPercent = currentMinBorrow.mul(100).div(minBorrow);
    if (currentMinBorrowPercent.gt(102) || currentMinBorrowPercent.lt(98)) {
      tx = await fuseFeeDistributor._setPoolLimits(minBorrow, ethers.constants.MaxUint256);
      await tx.wait();
      console.log("FeeDistributor pool limits set", tx.hash);
    } else {
      console.log(
        `current min borrow ${currentMinBorrow} is within 2% of the actual value ${minBorrow} - not updating it`
      );
    }
  } catch (e) {
    console.log("error setting the pool limits", e);
  }

  const oldComptroller = await ethers.getContractOrNull("Comptroller");

  const comp = await deployments.deploy("Comptroller", {
    contract: "Comptroller.sol:Comptroller",
    from: deployer,
    args: [],
    log: true
  });
  if (comp.transactionHash) await ethers.provider.waitForTransaction(comp.transactionHash);
  console.log("Comptroller ", comp.address);

  const compFirstExtension = await deployments.deploy("ComptrollerFirstExtension", {
    contract: "ComptrollerFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (compFirstExtension.transactionHash) await ethers.provider.waitForTransaction(compFirstExtension.transactionHash);
  console.log("ComptrollerFirstExtension", compFirstExtension.address);

  const cTokenFirstExtension = await deployments.deploy("CTokenFirstExtension", {
    contract: "CTokenFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (cTokenFirstExtension.transactionHash)
    await ethers.provider.waitForTransaction(cTokenFirstExtension.transactionHash);
  console.log("CTokenFirstExtension", cTokenFirstExtension.address);

  const erc20Del = await deployments.deploy("CErc20Delegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (erc20Del.transactionHash) await ethers.provider.waitForTransaction(erc20Del.transactionHash);
  console.log("CErc20Delegate: ", erc20Del.address);

  const erc20PluginDel = await deployments.deploy("CErc20PluginDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20PluginDelegate: ", erc20PluginDel.address);

  const erc20RewardsDel = await deployments.deploy("CErc20RewardsDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20RewardsDelegate: ", erc20RewardsDel.address);

  const erc20PluginRewardsDel = await deployments.deploy("CErc20PluginRewardsDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20PluginRewardsDelegate: ", erc20PluginRewardsDel.address);
  ////
  //// FUSE CORE CONTRACTS
  const fpd = await deployments.deploy("PoolDirectory", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [false, []]
        }
      },
      owner: deployer
    },
    waitConfirmations: 1
  });
  if (fpd.transactionHash) await ethers.provider.waitForTransaction(fpd.transactionHash);
  console.log("PoolDirectory: ", fpd.address);
  const fusePoolDirectory = await ethers.getContract("PoolDirectory", deployer);

  const comptroller = await ethers.getContract("Comptroller", deployer);

  /// LATEST IMPLEMENTATIONS
  // Comptroller
  if (oldComptroller) {
    const latestComptrollerImplementation = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(
      oldComptroller.address
    );
    if (
      latestComptrollerImplementation === constants.AddressZero ||
      latestComptrollerImplementation !== comptroller.address
    ) {
      tx = await fuseFeeDistributor._setLatestComptrollerImplementation(oldComptroller.address, comptroller.address);
      await tx.wait();
      console.log(`Set the latest Comptroller implementation for ${oldComptroller.address} to ${comptroller.address}`);
    } else {
      console.log(`No change in the latest Comptroller implementation ${comptroller.address}`);
    }
  } else {
    // on the first deploy to a chain
    tx = await fuseFeeDistributor._setLatestComptrollerImplementation(constants.AddressZero, comptroller.address);
    await tx.wait();
    console.log(`Set the latest Comptroller implementation for ${constants.AddressZero} to ${comptroller.address}`);
  }

  const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(comptroller.address);
  if (comptrollerExtensions.length == 0 || comptrollerExtensions[1] != compFirstExtension.address) {
    tx = await fuseFeeDistributor._setComptrollerExtensions(comptroller.address, [
      comptroller.address,
      compFirstExtension.address
    ]);
    await tx.wait();
    console.log(`configured the extensions for comptroller ${comptroller.address}`);
  } else {
    console.log(`comptroller extensions already configured`);
  }

  const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);

  {
    // CErc20Delegate
    const erc20DelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20Del.address);
    if (erc20DelExtensions.length == 0 || erc20DelExtensions[0] != erc20Del.address) {
      tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20Del.address, [
        erc20Del.address,
        cTokenFirstExtension.address
      ]);
      await tx.wait();
      console.log(`configured the extensions for the CErc20Delegate ${erc20Del.address}`);
    } else {
      console.log(`CErc20Delegate extensions already configured`);
    }
    const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(1);
    if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Del.address) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(1, erc20Del.address, becomeImplementationData);
      await tx.wait();
      console.log(`Set the latest CErc20Delegate implementation from ${latestCErc20Delegate} to ${erc20Del.address}`);
    } else {
      console.log(`No change in the latest CErc20Delegate implementation ${erc20Del.address}`);
    }
  }

  {
    // CErc20PluginDelegate
    const erc20PluginDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20PluginDel.address
    );
    if (erc20PluginDelExtensions.length == 0 || erc20PluginDelExtensions[0] != erc20PluginDel.address) {
      tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginDel.address, [
        erc20PluginDel.address,
        cTokenFirstExtension.address
      ]);
      await tx.wait();
      console.log(`configured the extensions for the CErc20PluginDelegate ${erc20PluginDel.address}`);
    } else {
      console.log(`CErc20PluginDelegate extensions already configured`);
    }

    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(2);
    if (latestCErc20PluginDelegate === constants.AddressZero || latestCErc20PluginDelegate !== erc20PluginDel.address) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(2, erc20PluginDel.address, becomeImplementationData);
      await tx.wait();
      console.log(
        `Set the latest CErc20PluginDelegate implementation from ${latestCErc20PluginDelegate} to ${erc20PluginDel.address}`
      );
    } else {
      console.log(`No change in the latest CErc20PluginDelegate implementation ${erc20PluginDel.address}`);
    }
  }

  {
    // CErc20RewardsDelegate
    const erc20RewardsDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20RewardsDel.address
    );
    if (erc20RewardsDelExtensions.length == 0 || erc20RewardsDelExtensions[0] != erc20RewardsDel.address) {
      tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20RewardsDel.address, [
        erc20RewardsDel.address,
        cTokenFirstExtension.address
      ]);
      await tx.wait();
      console.log(`configured the extensions for the CErc20RewardsDelegate ${erc20RewardsDel.address}`);
    } else {
      console.log(`CErc20RewardsDelegate extensions already configured`);
    }
    const [latestCErc20RewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(3);
    if (
      latestCErc20RewardsDelegate === constants.AddressZero ||
      latestCErc20RewardsDelegate !== erc20RewardsDel.address
    ) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(3, erc20RewardsDel.address, becomeImplementationData);
      await tx.wait();
      console.log(
        `Set the latest CErc20RewardsDelegate implementation from ${latestCErc20RewardsDelegate} to ${erc20RewardsDel.address}`
      );
    } else {
      console.log(`No change in the latest CErc20RewardsDelegate implementation ${erc20RewardsDel.address}`);
    }
  }

  {
    // CErc20PluginRewardsDelegate
    const erc20PluginRewardsDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20PluginRewardsDel.address
    );
    if (
      erc20PluginRewardsDelExtensions.length == 0 ||
      erc20PluginRewardsDelExtensions[0] != erc20PluginRewardsDel.address
    ) {
      tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginRewardsDel.address, [
        erc20PluginRewardsDel.address,
        cTokenFirstExtension.address
      ]);
      await tx.wait();
      console.log(`configured the extensions for the CErc20PluginRewardsDelegate ${erc20PluginRewardsDel.address}`);
    } else {
      console.log(`CErc20PluginRewardsDelegate extensions already configured`);
    }
    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(4);
    if (
      latestCErc20PluginRewardsDelegate === constants.AddressZero ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDel.address
    ) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        4,
        erc20PluginRewardsDel.address,
        becomeImplementationData
      );
      await tx.wait();
      console.log(
        `Set the latest CErc20PluginRewardsDelegate implementation from ${latestCErc20PluginRewardsDelegate} to ${erc20PluginRewardsDel.address}`
      );
    } else {
      console.log(
        `No change in the latest CErc20PluginRewardsDelegate implementation ${erc20PluginRewardsDel.address}`
      );
    }
  }

  const fplDeployment = await deployments.deploy("PoolLens", {
    from: deployer,
    log: true,
    waitConfirmations: 1
  });

  if (fplDeployment.transactionHash) await ethers.provider.waitForTransaction(fplDeployment.transactionHash);
  console.log("PoolLens: ", fplDeployment.address);
  const fusePoolLens = await ethers.getContract("PoolLens", deployer);
  let directory = await fusePoolLens.directory();
  if (directory === constants.AddressZero) {
    tx = await fusePoolLens.initialize(
      fusePoolDirectory.address,
      chainDeployParams.nativeTokenName,
      chainDeployParams.nativeTokenSymbol,
      chainDeployParams.uniswap.hardcoded.map((h) => h.address),
      chainDeployParams.uniswap.hardcoded.map((h) => h.name),
      chainDeployParams.uniswap.hardcoded.map((h) => h.symbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpName),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpSymbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpDisplayName)
    );
    await tx.wait();
    console.log("PoolLens initialized", tx.hash);
  } else {
    console.log("PoolLens already initialized");
  }

  const fpls = await deployments.deploy("PoolLensSecondary", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (fpls.transactionHash) await ethers.provider.waitForTransaction(fpls.transactionHash);
  console.log("PoolLensSecondary: ", fpls.address);

  const fusePoolLensSecondary = await ethers.getContract("PoolLensSecondary", deployer);
  directory = await fusePoolLensSecondary.directory();
  if (directory === constants.AddressZero) {
    tx = await fusePoolLensSecondary.initialize(fusePoolDirectory.address);
    await tx.wait();
    console.log("PoolLensSecondary initialized", tx.hash);
  } else {
    console.log("PoolLensSecondary already initialized");
  }

  const mflrReceipt = await deployments.deploy("IonicFlywheelLensRouter", {
    from: deployer,
    args: [fpd.address],
    log: true,
    waitConfirmations: 1
  });
  if (mflrReceipt.transactionHash) await ethers.provider.waitForTransaction(mflrReceipt.transactionHash);
  console.log("IonicFlywheelLensRouter: ", mflrReceipt.address);

  const booster = await deployments.deploy("LooplessFlywheelBooster", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (booster.transactionHash) await ethers.provider.waitForTransaction(booster.transactionHash);
  console.log("LooplessFlywheelBooster: ", booster.address);
  if (booster.newlyDeployed) await run("flywheels:booster:update");

  ////
  //// ORACLES
  const fixedNativePO = await deployments.deploy("FixedNativePriceOracle", {
    from: deployer,
    args: [],
    log: true
  });
  console.log("FixedNativePriceOracle: ", fixedNativePO.address);

  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
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
  if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
  console.log("SimplePriceOracle: ", simplePO.address);

  await deployments.deploy("MasterPriceOracle", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
            [constants.AddressZero, chainDeployParams.wtoken],
            [fixedNativePO.address, fixedNativePO.address],
            constants.AddressZero,
            deployer,
            true,
            chainDeployParams.wtoken
          ]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer
    },
    waitConfirmations: 1
  });
  console.log(
    `Initialised MPO with for tokens: ${constants.AddressZero}: ${fixedNativePO.address}, ${chainDeployParams.wtoken}: ${fixedNativePO.address}`
  );

  ////
  //// HELPERS - ADDRESSES PROVIDER
  await deployments.deploy("AddressesProvider", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployer]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer
    },
    waitConfirmations: 1
  });

  ////
  //// IRM MODELS
  await deployIRMs({ run, ethers, getNamedAccounts, deployments, deployConfig: chainDeployParams });
  ////

  //// Liquidator
  await deployIonicLiquidator({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig: chainDeployParams
  });
  ///

  ////
  //// CHAIN SPECIFIC DEPLOYMENT
  console.log("Running deployment for chain: ", chainId);
  if (deployFunc) {
    await deployFunc({ run, ethers, getNamedAccounts, deployments });
  }
  ////

  //// Configure Liquidator
  await configureIonicLiquidator({
    ethers,
    getNamedAccounts,
    chainId
  });
  ///

  // OPTIMIZED VAULTS
  // Deploy vaults registry
  if (chainId !== 1 && chainId !== 59144) {
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
        owner: deployer
      },
      waitConfirmations: 1
    });
    if (vaultsRegistry.transactionHash) await ethers.provider.waitForTransaction(vaultsRegistry.transactionHash);
    console.log("OptimizedVaultsRegistry: ", vaultsRegistry.address);
  }
  ////

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  //// LIQUIDATORS REGISTRY
  const liquidatorsRegistryDep = await deployments.deploy("LiquidatorsRegistry", {
    from: deployer,
    log: true,
    args: [addressesProvider.address]
  });
  if (liquidatorsRegistryDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryDep.transactionHash);
  console.log("LiquidatorsRegistry: ", liquidatorsRegistryDep.address);
  const liquidatorsRegistryExtensionDep = await deployments.deploy("LiquidatorsRegistryExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistryExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryExtensionDep.transactionHash);
  console.log("LiquidatorsRegistryExtension: ", liquidatorsRegistryExtensionDep.address);
  const liquidatorsRegistrySecondExtensionDep = await deployments.deploy("LiquidatorsRegistrySecondExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistrySecondExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistrySecondExtensionDep.transactionHash);
  console.log("LiquidatorsRegistrySecondExtension: ", liquidatorsRegistryExtensionDep.address);

  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;
  const currentLRExtensions = await liquidatorsRegistry._listExtensions();
  if (currentLRExtensions.length == 0) {
    tx = await liquidatorsRegistry._registerExtension(liquidatorsRegistryExtensionDep.address, constants.AddressZero);
    await tx.wait();
    console.log(`registered the first liquidators registry extension ${liquidatorsRegistryExtensionDep.address}`);
    tx = await liquidatorsRegistry._registerExtension(
      liquidatorsRegistrySecondExtensionDep.address,
      constants.AddressZero
    );
    await tx.wait();
    console.log(
      `registered the second liquidators registry extension ${liquidatorsRegistrySecondExtensionDep.address}`
    );
  } else {
    if (currentLRExtensions.length == 1) {
      tx = await liquidatorsRegistry._registerExtension(
        liquidatorsRegistryExtensionDep.address,
        currentLRExtensions[0]
      );
      await tx.wait();
      console.log(
        `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
      );
      tx = await liquidatorsRegistry._registerExtension(
        liquidatorsRegistrySecondExtensionDep.address,
        constants.AddressZero
      );
      await tx.wait();
      console.log(
        `registered the second liquidators registry extension ${liquidatorsRegistrySecondExtensionDep.address}`
      );
    } else if (currentLRExtensions.length == 2) {
      if (
        currentLRExtensions[0] != liquidatorsRegistryExtensionDep.address ||
        currentLRExtensions[1] != liquidatorsRegistrySecondExtensionDep.address
      ) {
        tx = await liquidatorsRegistry._registerExtension(
          liquidatorsRegistryExtensionDep.address,
          currentLRExtensions[0]
        );
        await tx.wait();
        console.log(
          `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
        );
        tx = await liquidatorsRegistry._registerExtension(
          liquidatorsRegistrySecondExtensionDep.address,
          currentLRExtensions[1]
        );
        await tx.wait();
        console.log(
          `replaced the liquidators registry second extension ${currentLRExtensions[1]} with the new ${liquidatorsRegistrySecondExtensionDep.address}`
        );
      } else {
        console.log(`no liquidators registry extensions to update`);
      }
    }
  }

  //// Configure Liquidators Registry
  await configureLiquidatorsRegistry({
    ethers,
    getNamedAccounts,
    chainId
  });
  ///
  ////

  //// LEVERED POSITIONS FACTORY
  if (chainId !== 1) {
    const lpfDep = await deployments.deploy("LeveredPositionFactory", {
      from: deployer,
      log: true,
      args: [ffd.address, liquidatorsRegistry.address, chainDeployParams.blocksPerYear],
      waitConfirmations: 1,
      skipIfAlreadyDeployed: true
    });
    if (lpfDep.transactionHash) await ethers.provider.waitForTransaction(lpfDep.transactionHash);
    console.log("LeveredPositionFactory: ", lpfDep.address);

    const lpfExt1Dep = await deployments.deploy("LeveredPositionFactoryFirstExtension", {
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });
    if (lpfExt1Dep.transactionHash) await ethers.provider.waitForTransaction(lpfExt1Dep.transactionHash);
    console.log("LeveredPositionFactoryFirstExtension: ", lpfExt1Dep.address);

    const lpfExt2Dep = await deployments.deploy("LeveredPositionFactorySecondExtension", {
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });
    if (lpfExt2Dep.transactionHash) await ethers.provider.waitForTransaction(lpfExt2Dep.transactionHash);
    console.log("LeveredPositionFactorySecondExtension: ", lpfExt2Dep.address);

    const leveredPositionFactory = (await ethers.getContract(
      "LeveredPositionFactory",
      deployer
    )) as LeveredPositionFactory;

    const currentLPFExtensions = await leveredPositionFactory._listExtensions();

    console.log("currentLPFExtensions: ", currentLPFExtensions.join(", "));

    if (currentLPFExtensions.length == 1) {
      tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, currentLPFExtensions[0]);
      await tx.wait();
      console.log("replaced the LeveredPositionFactory first extension: ", tx.hash);
      tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, constants.AddressZero);
      await tx.wait();
      console.log("registered the LeveredPositionFactory second extension: ", tx.hash);
    } else if (currentLPFExtensions.length == 2) {
      if (lpfExt1Dep.address.toLowerCase() != currentLPFExtensions[0].toLowerCase()) {
        console.log(`replacing ${currentLPFExtensions[0]} with ${lpfExt1Dep.address}`);
        tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, currentLPFExtensions[0]);
        await tx.wait();
        console.log("replaced the LeveredPositionFactory first extension: ", tx.hash);
      }
      if (lpfExt2Dep.address.toLowerCase() != currentLPFExtensions[1].toLowerCase()) {
        console.log(`replacing ${currentLPFExtensions[1]} with ${lpfExt2Dep.address}`);
        tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, currentLPFExtensions[1]);
        await tx.wait();
        console.log("replaced the LeveredPositionFactory second extension: ", tx.hash);
      }
    } else if (currentLPFExtensions.length == 0) {
      console.log(`no LeveredPositionFactory extensions configured, adding them`);
      tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, constants.AddressZero);
      await tx.wait();
      console.log("registered the LeveredPositionFactory first extension: ", tx.hash);
      tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, constants.AddressZero);
      await tx.wait();
      console.log("registered the LeveredPositionFactory second extension: ", tx.hash);
    } else {
      console.log(`no LeveredPositionFactory extensions to update`);
    }

    //// LEVERED POSITIONS LENS
    const lpLens = await deployments.deploy("LeveredPositionsLens", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [leveredPositionFactory.address]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer
      }
    });
    if (lpLens.transactionHash) await ethers.provider.waitForTransaction(lpLens.transactionHash);
    console.log("LeveredPositionsLens: ", lpLens.address);

    //// AUTHORITIES REGISTRY
    await deployments.deploy("AuthoritiesRegistry", {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [leveredPositionFactory.address]
          },
          onUpgrade: {
            methodName: "reinitialize",
            args: [leveredPositionFactory.address]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: deployer
      },
      waitConfirmations: 1
    });

    const authoritiesRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;

    const ffdAuthRegistry = await fuseFeeDistributor.callStatic.authoritiesRegistry();
    if (ffdAuthRegistry.toLowerCase() != authoritiesRegistry.address.toLowerCase()) {
      // set the address in the FFD
      tx = await fuseFeeDistributor.reinitialize(authoritiesRegistry.address);
      await tx.wait();
      console.log(`configured the auth registry in the FFD`);
    }
    const leveredPosFactoryAr = await authoritiesRegistry.callStatic.leveredPositionsFactory();
    if (leveredPosFactoryAr.toLowerCase() != leveredPositionFactory.address.toLowerCase()) {
      // set the address in the AR
      tx = await authoritiesRegistry.reinitialize(authoritiesRegistry.address);
      await tx.wait();
      console.log(`configured the auth registry in the FFD`);
    }
    ////
  }

  if (chainId !== 1) {
    await configureAddressesProviderAddresses({
      ethers,
      getNamedAccounts,
      chainId,
      deployConfig: chainDeployParams
    });
  }
  // upgrade any of the pools if necessary
  // the markets are also autoupgraded with this task
  await run("pools:all:upgrade");

  const gasUsed = deployments.getGasUsed();

  const gasPrice = await ethers.provider.getGasPrice();

  console.log(`gas price ${gasPrice}`);
  console.log(`gas used ${gasUsed}`);
  console.log(`cg price ${cgPrice}`);
  console.log(`total $ value gas used for deployments ${(gasPrice.toNumber() * gasUsed * cgPrice) / 1e18}`);
};

func.tags = ["prod"];

export default func;

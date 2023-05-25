import { constants, providers, utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { deployIRMs } from "../chainDeploy/helpers";
import { getCgPrice } from "../chainDeploy/helpers/getCgPrice";
import {
  configureAddressesProviderStrategies,
  configureFuseSafeLiquidator,
  deployFuseSafeLiquidator,
} from "../chainDeploy/helpers/liquidators/fuseSafeLiquidator";
import { configureLiquidatorsRegistry } from "../chainDeploy/helpers/liquidators/registry";
import { AddressesProvider } from "../typechain/AddressesProvider";
import { FuseFeeDistributor } from "../typechain/FuseFeeDistributor";
import { LeveredPositionFactory } from "../typechain/LeveredPositionFactory";
import { LiquidatorsRegistry } from "../typechain/LiquidatorsRegistry";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);
  const MIN_BORROW_USD = chainId === 97 || chainId === 245022926 ? 0 : 100;
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

  ////
  //// COMPOUND CORE CONTRACTS
  let tx: providers.TransactionResponse;

  const ffd = await deployments.deploy("FuseFeeDistributor", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [ethers.utils.parseEther("0.1")],
        },
      },
      owner: deployer,
    },
  });
  if (ffd.transactionHash) await ethers.provider.waitForTransaction(ffd.transactionHash);

  console.log("FuseFeeDistributor: ", ffd.address);
  const fuseFeeDistributor = (await ethers.getContract("FuseFeeDistributor", deployer)) as FuseFeeDistributor;

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

  const cgPrice = await getCgPrice(chainDeployParams.cgId);
  const minBorrow = utils.parseUnits((MIN_BORROW_USD / cgPrice).toFixed(18));

  try {
    const currentMinBorrow = await fuseFeeDistributor.callStatic.minBorrowEth();
    const currentMinBorrowPercent = currentMinBorrow.mul(100).div(minBorrow);
    if (currentMinBorrowPercent.gt(102) || currentMinBorrowPercent.lt(98)) {
      console.log(
        `setting the pool limits to ${minBorrow} ${ethers.constants.MaxUint256} ${ethers.constants.MaxUint256}`
      );
      tx = await fuseFeeDistributor._setPoolLimits(minBorrow, ethers.constants.MaxUint256, ethers.constants.MaxUint256);
      await tx.wait();
      console.log("FuseFeeDistributor pool limits set", tx.hash);
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
    args: [ffd.address],
    log: true,
  });
  if (comp.transactionHash) await ethers.provider.waitForTransaction(comp.transactionHash);
  console.log("Comptroller ", comp.address);

  const compFirstExtension = await deployments.deploy("ComptrollerFirstExtension", {
    contract: "ComptrollerFirstExtension",
    from: deployer,
    args: [],
    log: true,
  });
  if (compFirstExtension.transactionHash) await ethers.provider.waitForTransaction(compFirstExtension.transactionHash);
  console.log("ComptrollerFirstExtension", compFirstExtension.address);

  const oldErc20Delegate = await ethers.getContractOrNull("CErc20Delegate");
  const oldErc20PluginDelegate = await ethers.getContractOrNull("CErc20PluginDelegate");
  const oldErc20PluginRewardsDelegate = await ethers.getContractOrNull("CErc20PluginRewardsDelegate");

  const cTokenFirstExtension = await deployments.deploy("CTokenFirstExtension", {
    contract: "CTokenFirstExtension",
    from: deployer,
    args: [],
    log: true,
  });
  if (cTokenFirstExtension.transactionHash)
    await ethers.provider.waitForTransaction(cTokenFirstExtension.transactionHash);
  console.log("CTokenFirstExtension", cTokenFirstExtension.address);

  const erc20Del = await deployments.deploy("CErc20Delegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (erc20Del.transactionHash) await ethers.provider.waitForTransaction(erc20Del.transactionHash);
  console.log("CErc20Delegate: ", erc20Del.address);

  const erc20PluginDel = await deployments.deploy("CErc20PluginDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("CErc20PluginDelegate: ", erc20PluginDel.address);

  const erc20PluginRewardsDel = await deployments.deploy("CErc20PluginRewardsDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("CErc20PluginRewardsDelegate: ", erc20PluginRewardsDel.address);
  ////
  //// FUSE CORE CONTRACTS
  const fpd = await deployments.deploy("FusePoolDirectory", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [false, []],
        },
      },
      owner: deployer,
    },
    waitConfirmations: 1,
  });
  if (fpd.transactionHash) await ethers.provider.waitForTransaction(fpd.transactionHash);
  console.log("FusePoolDirectory: ", fpd.address);
  const fusePoolDirectory = await ethers.getContract("FusePoolDirectory", deployer);

  const comptroller = await ethers.getContract("Comptroller", deployer);
  const oldComptrollerImplementations = [constants.AddressZero];
  const newComptrollerImplementations = [comptroller.address];
  const comptrollerArrayOfTrue = [true];
  if (oldComptroller && oldComptroller.address != comptroller.address) {
    oldComptrollerImplementations.push(oldComptroller.address);
    newComptrollerImplementations.push(comptroller.address);
    comptrollerArrayOfTrue.push(true);
  }

  if (oldComptrollerImplementations.length) {
    let anyNotWhitelisted = false;
    for (let i = 0; i < oldComptrollerImplementations.length; i++) {
      const whitelisted = await fuseFeeDistributor.callStatic.comptrollerImplementationWhitelist(
        oldComptrollerImplementations[i],
        newComptrollerImplementations[i]
      );
      if (!whitelisted) {
        anyNotWhitelisted = true;
        break;
      }
    }

    if (anyNotWhitelisted) {
      tx = await fuseFeeDistributor._editComptrollerImplementationWhitelist(
        oldComptrollerImplementations,
        newComptrollerImplementations,
        comptrollerArrayOfTrue
      );
      await tx.wait();
      console.log("FuseFeeDistributor comptroller whitelist set", tx.hash);
    }
  }

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
  }

  const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(comptroller.address);
  if (comptrollerExtensions.length != 1 || comptrollerExtensions[0] != compFirstExtension.address) {
    tx = await fuseFeeDistributor._setComptrollerExtensions(comptroller.address, [compFirstExtension.address]);
    await tx.wait();
    console.log(`configured the extensions for comptroller ${comptroller.address}`);
  } else {
    console.log(`comptroller extensions already configured`);
  }

  const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);

  const erc20DelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20Del.address);
  if (erc20DelExtensions.length != 1 || erc20DelExtensions[0] != cTokenFirstExtension.address) {
    tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20Del.address, [cTokenFirstExtension.address]);
    await tx.wait();
    console.log(`configured the extensions for the CErc20Delegate ${erc20Del.address}`);
  } else {
    console.log(`CErc20Delegate extensions already configured`);
  }

  if (oldErc20Delegate) {
    // CErc20Delegate
    const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(oldErc20Delegate.address);
    if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Del.address) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        oldErc20Delegate.address,
        erc20Del.address,
        false,
        becomeImplementationData
      );
      await tx.wait();
      console.log(`Set the latest CErc20Delegate implementation from ${latestCErc20Delegate} to ${erc20Del.address}`);
    } else {
      console.log(`No change in the latest CErc20Delegate implementation ${erc20Del.address}`);
    }
  }

  const erc20PluginDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
    erc20PluginDel.address
  );
  if (erc20PluginDelExtensions.length != 1 || erc20PluginDelExtensions[0] != cTokenFirstExtension.address) {
    tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginDel.address, [cTokenFirstExtension.address]);
    await tx.wait();
    console.log(`configured the extensions for the CErc20PluginDelegate ${erc20PluginDel.address}`);
  } else {
    console.log(`CErc20PluginDelegate extensions already configured`);
  }

  if (oldErc20PluginDelegate) {
    // CErc20PluginDelegate
    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
      oldErc20PluginDelegate.address
    );
    if (latestCErc20PluginDelegate === constants.AddressZero || latestCErc20PluginDelegate !== erc20PluginDel.address) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        oldErc20PluginDelegate.address,
        erc20PluginDel.address,
        false,
        becomeImplementationData
      );
      await tx.wait();
      console.log(
        `Set the latest CErc20PluginDelegate implementation from ${latestCErc20PluginDelegate} to ${erc20PluginDel.address}`
      );
    } else {
      console.log(`No change in the latest CErc20PluginDelegate implementation ${erc20PluginDel.address}`);
    }
  }

  const erc20PluginRewardsDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
    erc20PluginRewardsDel.address
  );
  if (
    erc20PluginRewardsDelExtensions.length != 1 ||
    erc20PluginRewardsDelExtensions[0] != cTokenFirstExtension.address
  ) {
    tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginRewardsDel.address, [
      cTokenFirstExtension.address,
    ]);
    await tx.wait();
    console.log(`configured the extensions for the CErc20PluginRewardsDelegate ${erc20PluginRewardsDel.address}`);
  } else {
    console.log(`CErc20PluginRewardsDelegate extensions already configured`);
  }

  if (oldErc20PluginRewardsDelegate) {
    // CErc20PluginRewardsDelegate
    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
      oldErc20PluginRewardsDelegate.address
    );
    if (
      latestCErc20PluginRewardsDelegate === constants.AddressZero ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDel.address
    ) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        oldErc20PluginRewardsDelegate.address,
        erc20PluginRewardsDel.address,
        false,
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

  const fplDeployment = await deployments.deploy("FusePoolLens", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  if (fplDeployment.transactionHash) await ethers.provider.waitForTransaction(fplDeployment.transactionHash);
  console.log("FusePoolLens: ", fplDeployment.address);
  const fusePoolLens = await ethers.getContract("FusePoolLens", deployer);
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
    console.log("FusePoolLens initialized", tx.hash);
  } else {
    console.log("FusePoolLens already initialized");
  }

  const fpls = await deployments.deploy("FusePoolLensSecondary", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (fpls.transactionHash) await ethers.provider.waitForTransaction(fpls.transactionHash);
  console.log("FusePoolLensSecondary: ", fpls.address);

  const fusePoolLensSecondary = await ethers.getContract("FusePoolLensSecondary", deployer);
  directory = await fusePoolLensSecondary.directory();
  if (directory === constants.AddressZero) {
    tx = await fusePoolLensSecondary.initialize(fusePoolDirectory.address);
    await tx.wait();
    console.log("FusePoolLensSecondary initialized", tx.hash);
  } else {
    console.log("FusePoolLensSecondary already initialized");
  }

  const mflrReceipt = await deployments.deploy("MidasFlywheelLensRouter", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (mflrReceipt.transactionHash) await ethers.provider.waitForTransaction(mflrReceipt.transactionHash);
  console.log("MidasFlywheelLensRouter: ", mflrReceipt.address);

  const booster = await deployments.deploy("LooplessFlywheelBooster", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1,
  });
  if (booster.transactionHash) await ethers.provider.waitForTransaction(booster.transactionHash);
  console.log("LooplessFlywheelBooster: ", booster.address);

  const erc20Delegate = await ethers.getContract("CErc20Delegate", deployer);
  const erc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate", deployer);
  const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", deployer);

  const oldImplementations = [constants.AddressZero, constants.AddressZero, constants.AddressZero];
  const newImplementations = [erc20Delegate.address, erc20PluginDelegate.address, erc20PluginRewardsDelegate.address];
  const arrayOfFalse = [false, false, false];
  const arrayOfTrue = [true, true, true];

  if (oldErc20Delegate) {
    oldImplementations.push(oldErc20Delegate.address);
    newImplementations.push(erc20Delegate.address);
    arrayOfFalse.push(false);
    arrayOfTrue.push(true);
  } else {
    console.log(`No old CErc20Delegate to whitelist the upgrade for`);
  }

  if (oldErc20PluginDelegate) {
    oldImplementations.push(oldErc20PluginDelegate.address);
    newImplementations.push(erc20PluginDelegate.address);
    arrayOfFalse.push(false);
    arrayOfTrue.push(true);
  } else {
    console.log(`No old CErc20PluginDelegate to whitelist the upgrade for`);
  }

  if (oldErc20PluginRewardsDelegate) {
    oldImplementations.push(oldErc20PluginRewardsDelegate.address);
    newImplementations.push(erc20PluginRewardsDelegate.address);
    arrayOfFalse.push(false);
    arrayOfTrue.push(true);
  } else {
    console.log(`No old CErc20PluginRewardsDelegate to whitelist the upgrade for`);
  }

  if (oldImplementations.length) {
    tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
      oldImplementations,
      newImplementations,
      arrayOfFalse,
      arrayOfTrue
    );

    await tx.wait();
    console.log("_editCErc20DelegateWhitelist:", tx.hash);
  } else {
    console.log(`No old delegates implementations to whitelist the upgrade for`);
  }
  ////

  ////
  //// ORACLES
  const fixedNativePO = await deployments.deploy("FixedNativePriceOracle", {
    from: deployer,
    args: [],
    log: true,
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
          args: [],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
    waitConfirmations: 1,
  });
  if (simplePO.transactionHash) await ethers.provider.waitForTransaction(simplePO.transactionHash);
  console.log("SimplePriceOracle: ", simplePO.address);

  const masterPO = await deployments.deploy("MasterPriceOracle", {
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
            chainDeployParams.wtoken,
          ],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
    waitConfirmations: 1,
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
          args: [deployer],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
    waitConfirmations: 1,
  });

  ////
  //// IRM MODELS
  await deployIRMs({ run, ethers, getNamedAccounts, deployments, deployConfig: chainDeployParams });
  ////

  //// Liquidator
  await deployFuseSafeLiquidator({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig: chainDeployParams,
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
  await configureFuseSafeLiquidator({
    ethers,
    getNamedAccounts,
    chainId,
  });
  ///

  //// OPTIMIZED VAULTS
  //// Deploy vaults registry
  console.log("Deploying the optimized APR vaults registry");
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
  if (vaultsRegistry.transactionHash) await ethers.provider.waitForTransaction(vaultsRegistry.transactionHash);
  console.log("OptimizedVaultsRegistry: ", vaultsRegistry.address);
  ////

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  //// LIQUIDATORS REGISTRY
  const liquidatorsRegistryDep = await deployments.deploy("LiquidatorsRegistry", {
    from: deployer,
    log: true,
    args: [addressesProvider.address],
  });
  if (liquidatorsRegistryDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryDep.transactionHash);
  console.log("LiquidatorsRegistry: ", liquidatorsRegistryDep.address);
  const liquidatorsRegistryExtensionDep = await deployments.deploy("LiquidatorsRegistryExtension", {
    from: deployer,
    log: true,
    args: [],
  });
  if (liquidatorsRegistryExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryExtensionDep.transactionHash);
  console.log("LiquidatorsRegistryExtension: ", liquidatorsRegistryExtensionDep.address);

  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;
  const currentLRExtensions = await liquidatorsRegistry._listExtensions();
  if (!currentLRExtensions.length || currentLRExtensions[0] != liquidatorsRegistryExtensionDep.address) {
    let extToReplace;
    if (currentLRExtensions.length == 0) {
      extToReplace = constants.AddressZero;
    } else {
      extToReplace = currentLRExtensions[0];
    }
    tx = await liquidatorsRegistry._registerExtension(liquidatorsRegistryExtensionDep.address, extToReplace);
    await tx.wait();
    console.log(
      `replaced the liquidators registry old extension ${extToReplace} with the new ${liquidatorsRegistryExtensionDep.address}`
    );
  } else {
    console.log(`no liquidators registry extensions to update`);
  }

  //// Configure Liquidators Registry
  await configureLiquidatorsRegistry({
    ethers,
    getNamedAccounts,
    chainId,
  });
  ///
  ////

  //// LEVERED POSITIONS FACTORY
  const lpfDep = await deployments.deploy("LeveredPositionFactory", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [ffd.address, liquidatorsRegistry.address, chainDeployParams.blocksPerYear],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
    waitConfirmations: 1,
  });
  if (lpfDep.transactionHash) await ethers.provider.waitForTransaction(lpfDep.transactionHash);
  console.log("LeveredPositionFactory: ", lpfDep.address);
  ////

  /// EXTERNAL ADDRESSES
  const uniswapV2FactoryAddress = await addressesProvider.callStatic.getAddress("IUniswapV2Factory");
  if (
    uniswapV2FactoryAddress !== chainDeployParams.uniswap.uniswapV2FactoryAddress &&
    chainDeployParams.uniswap.uniswapV2FactoryAddress
  ) {
    tx = await addressesProvider.setAddress("IUniswapV2Factory", chainDeployParams.uniswap.uniswapV2FactoryAddress);
    await tx.wait();
    console.log("setAddress IUniswapV2Factory: ", tx.hash);
  }

  const uniswapV2RouterAddress = await addressesProvider.callStatic.getAddress("IUniswapV2Router02");
  if (
    uniswapV2RouterAddress !== chainDeployParams.uniswap.uniswapV2RouterAddress &&
    chainDeployParams.uniswap.uniswapV2RouterAddress
  ) {
    tx = await addressesProvider.setAddress("IUniswapV2Router02", chainDeployParams.uniswap.uniswapV2RouterAddress);
    await tx.wait();
    console.log("setAddress IUniswapV2Router02: ", tx.hash);
  }

  const wtokenAddress = await addressesProvider.callStatic.getAddress("wtoken");
  if (wtokenAddress !== chainDeployParams.wtoken) {
    tx = await addressesProvider.setAddress("wtoken", chainDeployParams.wtoken);
    await tx.wait();
    console.log("setAddress wtoken: ", tx.hash);
  }

  const wBTCTokenAddress = await addressesProvider.callStatic.getAddress("wBTCToken");
  if (wBTCTokenAddress !== chainDeployParams.wBTCToken && chainDeployParams.wBTCToken) {
    tx = await addressesProvider.setAddress("wBTCToken", chainDeployParams.wBTCToken);
    await tx.wait();
    console.log("setAddress wBTCToken: ", tx.hash);
  }

  const stableTokenAddress = await addressesProvider.callStatic.getAddress("stableToken");
  if (stableTokenAddress !== chainDeployParams.stableToken && chainDeployParams.stableToken) {
    tx = await addressesProvider.setAddress("stableToken", chainDeployParams.stableToken);
    await tx.wait();
    console.log("setAddress stableToken: ", tx.hash);
  }

  /// SYSTEM ADDRESSES
  const currentDeployer = await addressesProvider.callStatic.getAddress("deployer");
  if (currentDeployer !== deployer) {
    tx = await addressesProvider.setAddress("deployer", deployer);
    await tx.wait();
    console.log("setAddress deployer", tx.hash);
  }

  const masterPOAddress = await addressesProvider.callStatic.getAddress("MasterPriceOracle");
  if (masterPOAddress !== masterPO.address) {
    tx = await addressesProvider.setAddress("MasterPriceOracle", masterPO.address);
    await tx.wait();
    console.log("setAddress MasterPriceOracle: ", tx.hash);
  }

  const fpdAddress = await addressesProvider.callStatic.getAddress("FusePoolDirectory");
  if (fpdAddress !== fpd.address) {
    tx = await addressesProvider.setAddress("FusePoolDirectory", fpd.address);
    await tx.wait();
    console.log("setAddress FusePoolDirectory: ", tx.hash);
  }

  const ffdAddress = await addressesProvider.callStatic.getAddress("FuseFeeDistributor");
  if (ffdAddress !== ffd.address) {
    tx = await addressesProvider.setAddress("FuseFeeDistributor", ffd.address);
    await tx.wait();
    console.log("setAddress FuseFeeDistributor: ", tx.hash);
  }

  const fsl = await ethers.getContract("FuseSafeLiquidator");
  const fslAddress = await addressesProvider.callStatic.getAddress("FuseSafeLiquidator");
  if (fslAddress !== fsl.address) {
    tx = await addressesProvider.setAddress("FuseSafeLiquidator", fsl.address);
    await tx.wait();
    console.log("setAddress FuseSafeLiquidator: ", tx.hash);
  }

  const dpa = await ethers.getContract("DefaultProxyAdmin");
  const dpaAddress = await addressesProvider.callStatic.getAddress("DefaultProxyAdmin");
  if (dpaAddress !== dpa.address) {
    tx = await addressesProvider.setAddress("DefaultProxyAdmin", dpa.address);
    await tx.wait();
    console.log("setAddress DefaultProxyAdmin: ", tx.hash);
  }

  const quoter = await ethers.getContractOrNull("Quoter");
  if (quoter != null) {
    const quoterAddress = await addressesProvider.callStatic.getAddress("Quoter");
    if (quoterAddress !== quoter.address) {
      tx = await addressesProvider.setAddress("Quoter", quoter.address);
      await tx.wait();
      console.log("setAddress Quoter: ", tx.hash);
    }
  }

  const ovr = await ethers.getContract("OptimizedVaultsRegistry");
  const ovrAddress = await addressesProvider.callStatic.getAddress("OptimizedVaultsRegistry");
  if (ovrAddress !== ovr.address) {
    tx = await addressesProvider.setAddress("OptimizedVaultsRegistry", ovr.address);
    await tx.wait();
    console.log("setAddress OptimizedVaultsRegistry: ", tx.hash);
  }

  const lr = await ethers.getContract("LiquidatorsRegistry");
  const lrAddress = await addressesProvider.callStatic.getAddress("LiquidatorsRegistry");
  if (lrAddress !== lr.address) {
    tx = await addressesProvider.setAddress("LiquidatorsRegistry", lr.address);
    await tx.wait();
    console.log("setAddress LiquidatorsRegistry: ", tx.hash);
  }

  const lpf = await ethers.getContract("LeveredPositionFactory");
  const lpfAddress = await addressesProvider.callStatic.getAddress("LeveredPositionFactory");
  if (lpfAddress !== lpf.address) {
    tx = await addressesProvider.setAddress("LeveredPositionFactory", lpf.address);
    await tx.wait();
    console.log("setAddress LeveredPositionFactory: ", tx.hash);
  }

  await configureAddressesProviderStrategies({
    ethers,
    getNamedAccounts,
    chainId,
  });

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

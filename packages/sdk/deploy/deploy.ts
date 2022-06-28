/* eslint-disable no-console */
import { constants, providers } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { deployIRMs } from "../chainDeploy/helpers";
import { configureFuseSafeLiquidator, deployFuseSafeLiquidator } from "../chainDeploy/helpers/liquidator";
import { AddressesProvider } from "../lib/contracts/typechain/AddressesProvider";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const chainId = await getChainId();
  console.log("chainId: ", chainId);
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("balance: ", balance.toString());
  const price = await ethers.provider.getGasPrice();
  console.log("price: ", ethers.utils.formatUnits(price, "gwei"));

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
  const fuseFeeDistributor = await ethers.getContract("FuseFeeDistributor", deployer);

  const ffdFee = await fuseFeeDistributor.defaultInterestFeeRate();
  console.log(`ffd fee ${ffdFee}`);
  if (ffdFee == 0) {
    tx = await fuseFeeDistributor._setDefaultInterestFeeRate(ethers.utils.parseEther("0.1"));
    await tx.wait();
    console.log(`updated the FFD fee with tx ${tx.hash}`);

    const feeAfter = await fuseFeeDistributor.defaultInterestFeeRate();
    console.log(`ffd fee updated to ${feeAfter}`);
  }

  tx = await fuseFeeDistributor._setPoolLimits(
    chainDeployParams.minBorrow,
    ethers.constants.MaxUint256,
    ethers.constants.MaxUint256
  );
  await tx.wait();
  console.log("FuseFeeDistributor pool limits set", tx.hash);

  const comp = await deployments.deploy("Comptroller", {
    contract: "Comptroller.sol:Comptroller",
    from: deployer,
    args: [ffd.address],
    log: true,
  });
  if (comp.transactionHash) await ethers.provider.waitForTransaction(comp.transactionHash);
  console.log("Comptroller.sol:Comptroller: ", comp.address);

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

  const ethDel = await deployments.deploy("CEtherDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (ethDel.transactionHash) await ethers.provider.waitForTransaction(ethDel.transactionHash);
  console.log("CEtherDelegate: ", ethDel.address);

  const rewards = await deployments.deploy("RewardsDistributorDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (rewards.transactionHash) await ethers.provider.waitForTransaction(rewards.transactionHash);
  // const rewardsDistributorDelegate = await ethers.getContract("RewardsDistributorDelegate", deployer);
  // await rewardsDistributorDelegate.initialize(constants.AddressZero);
  console.log("RewardsDistributorDelegate: ", rewards.address);
  ////

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
  const whitelisted = await fuseFeeDistributor.callStatic.comptrollerImplementationWhitelist(
    constants.AddressZero,
    comptroller.address
  );
  console.log("whitelisted: ", whitelisted);
  tx = await fuseFeeDistributor._editComptrollerImplementationWhitelist(
    [constants.AddressZero],
    [comptroller.address],
    [true]
  );
  await tx.wait();
  console.log("FuseFeeDistributor comptroller whitelist set", tx.hash);

  const autoImplementation = await comptroller.callStatic.autoImplementation();
  console.log("autoImplementation: ", autoImplementation);
  if (!autoImplementation) {
    tx = await comptroller._toggleAutoImplementations(true);
    await tx.wait();
    console.log("Toggled comptroller AutoImplementation", tx.hash);
  } else {
    console.log("Comptroller AutoImplementation already set");
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

  const fflrReceipt = await deployments.deploy("FuseFlywheelLensRouter", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (fflrReceipt.transactionHash) await ethers.provider.waitForTransaction(fflrReceipt.transactionHash);
  console.log("FuseFlywheelLensRouter: ", fflrReceipt.address);

  const etherDelegate = await ethers.getContract("CEtherDelegate", deployer);
  const erc20Delegate = await ethers.getContract("CErc20Delegate", deployer);
  const erc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate", deployer);
  const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", deployer);

  let receipt: providers.TransactionReceipt;
  const cetherDelegateWhitelist = await fuseFeeDistributor.callStatic.cEtherDelegateWhitelist(
    constants.AddressZero,
    etherDelegate.address,
    false
  );
  console.log("cetherDelegateWhitelist: ", cetherDelegateWhitelist);

  tx = await fuseFeeDistributor._editCEtherDelegateWhitelist(
    [constants.AddressZero],
    [etherDelegate.address],
    [false],
    [true]
  );
  receipt = await tx.wait();
  console.log("Set whitelist for Ether Delegate with status:", receipt.status, tx.hash);

  tx = await fuseFeeDistributor._editCErc20DelegateWhitelist(
    [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      erc20Delegate.address,
      erc20Delegate.address,
      erc20PluginDelegate.address,
      erc20PluginRewardsDelegate.address,
    ],
    [
      erc20Delegate.address,
      erc20PluginDelegate.address,
      erc20PluginRewardsDelegate.address,
      erc20PluginDelegate.address,
      erc20PluginRewardsDelegate.address,
      erc20PluginDelegate.address,
      erc20PluginRewardsDelegate.address,
    ],
    [false, false, false, false, false, false, false],
    [true, true, true, true, true, true, true]
  );
  receipt = await tx.wait();
  console.log("Set whitelist for ERC20 Delegate with status:", receipt.status);

  await deployments.deploy("InitializableClones", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  ////

  ////
  //// ORACLES
  const fixedNativePO = await deployments.deploy("FixedNativePriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  console.log("FixedNativePriceOracle: ", fixedNativePO.address);

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

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  /// EXTERNAL ADDRESSES
  tx = await addressesProvider.setAddress("IUniswapV2Factory", chainDeployParams.uniswap.uniswapV2FactoryAddress);
  await tx.wait();
  console.log("setAddress: ", tx.hash);

  tx = await addressesProvider.setAddress("wtoken", chainDeployParams.wtoken);
  await tx.wait();
  console.log("setAddress: ", tx.hash);

  /// SYSTEM ADDRESSES
  tx = await addressesProvider.setAddress("MasterPriceOracle", masterPO.address);
  await tx.wait();
  console.log("setAddress: ", tx.hash);
};

func.tags = ["prod"];

export default func;

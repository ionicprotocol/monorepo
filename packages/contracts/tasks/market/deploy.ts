import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, Hash, parseAbiParameters, parseEther, zeroAddress } from "viem";

import { MarketConfig } from "../../chainDeploy";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";
import { chainIdtoChain } from "@ionicprotocol/chains";

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .addOptionalParam("initialSupplyCap", "Initial supply cap", undefined, types.string)
  .addOptionalParam("initialBorrowCap", "Initial borrow cap", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
    const comptroller = await viem.getContractAt("IonicComptroller", taskArgs.comptroller as Address, {
      client: { public: publicClient, wallet: walletClient }
    });

    const delegateType = 1;
    const implementationData = "0x00";

    const config: MarketConfig = {
      underlying: taskArgs.underlying,
      comptroller: comptroller.address,
      adminFee: 10,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: (await deployments.get("JumpRateModel")).address as Address,
      reserveFactor: 10,
      bypassPriceFeedCheck: true,
      feeDistributor: (await deployments.get("FeeDistributor")).address as Address,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    };

    const reserveFactorBN = parseEther((config.reserveFactor / 100).toString());
    const adminFeeBN = parseEther((config.adminFee / 100).toString());
    const collateralFactorBN = parseEther((config.collateralFactor / 100).toString());

    console.log("collateralFactorBN", collateralFactorBN.toString());
    console.log("constructor params: ", [
      config.underlying,
      config.comptroller,
      config.feeDistributor,
      config.interestRateModel,
      config.name,
      config.symbol,
      reserveFactorBN,
      adminFeeBN
    ]);
    const constructorData = encodeAbiParameters(
      parseAbiParameters("address,address,address,address,string,string,uint256,uint256"),
      [
        config.underlying,
        config.comptroller,
        config.feeDistributor,
        config.interestRateModel,
        config.name,
        config.symbol,
        reserveFactorBN,
        adminFeeBN
      ]
    );
    console.log("constructorData", constructorData);

    const owner = (await comptroller.read.admin()) as Address;
    // Test Transaction
    const errorCode = await comptroller.simulate._deployMarket(
      [delegateType, constructorData, implementationData, collateralFactorBN],
      { account: owner }
    );
    if (errorCode.result !== 0n) {
      throw `Unable to _deployMarket: ${errorCode.result}`;
    }
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: comptroller,
        functionName: "_deployMarket",
        args: [delegateType, constructorData, implementationData, collateralFactorBN],
        description: `Deploy market for ${config.underlying}`,
        inputs: [
          { internalType: "uint8", name: "delegateType", type: "uint8" },
          { internalType: "bytes", name: "constructorData", type: "bytes" },
          { internalType: "bytes", name: "implementationData", type: "bytes" },
          { internalType: "uint256", name: "collateralFactor", type: "uint256" }
        ]
      });
    } else {
      // Make actual Transaction
      const tx = await comptroller.write._deployMarket([
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      ]);
      console.log("tx", tx);

      // Recreate Address of Deployed Market
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      if (receipt.status !== "success") {
        throw `Failed to deploy market for ${config.underlying}`;
      }
    }
  });

task("market:deploy-morpho", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .addOptionalParam("initialSupplyCap", "Initial supply cap", undefined, types.string)
  .addOptionalParam("initialBorrowCap", "Initial borrow cap", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());
    const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
    const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
    const comptroller = await viem.getContractAt("IonicComptroller", taskArgs.comptroller as Address, {
      client: { public: publicClient, wallet: walletClient }
    });

    const becomeImplementationData = encodeAbiParameters(parseAbiParameters("address"), [zeroAddress]);
    const delegateType = 5;
    const implementationData = "0x00";

    const fuseFeeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address,
      { client: { public: publicClient, wallet: walletClient } }
    );
    let tx: Hash;

    const cTokenFirstExtension = await deployments.deploy("CTokenFirstExtension", {
      contract: "CTokenFirstExtension",
      from: deployer,
      args: [],
      log: true
    });
    if (cTokenFirstExtension.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: cTokenFirstExtension.transactionHash as Hash });
    console.log("CTokenFirstExtension", cTokenFirstExtension.address);

    const erc20DelMorpho = await deployments.deploy("CErc20RewardsDelegateMorpho", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1
    });
    if (erc20DelMorpho.transactionHash)
      await publicClient.waitForTransactionReceipt({ hash: erc20DelMorpho.transactionHash as Hash });
    console.log("CErc20RewardsDelegateMorpho: ", erc20DelMorpho.address);

    tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
      erc20DelMorpho.address as Address,
      [erc20DelMorpho.address as Address, cTokenFirstExtension.address as Address]
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`configured the extensions for the CErc20DelegateMorpho ${erc20DelMorpho.address}`);

    tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
      delegateType,
      erc20DelMorpho.address as Address,
      becomeImplementationData
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Set the latest CErc20DelegateMorpho implementation to ${erc20DelMorpho.address}`);

    const config: MarketConfig = {
      underlying: taskArgs.underlying,
      comptroller: comptroller.address,
      adminFee: 10,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: (await deployments.get("JumpRateModel")).address as Address,
      reserveFactor: 10,
      bypassPriceFeedCheck: true,
      feeDistributor: (await deployments.get("FeeDistributor")).address as Address,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    };

    const reserveFactorBN = parseEther((config.reserveFactor / 100).toString());
    const adminFeeBN = parseEther((config.adminFee / 100).toString());
    const collateralFactorBN = parseEther((config.collateralFactor / 100).toString());

    console.log("collateralFactorBN", collateralFactorBN.toString());
    console.log("constructor params: ", [
      config.underlying,
      config.comptroller,
      config.feeDistributor,
      config.interestRateModel,
      config.name,
      config.symbol,
      reserveFactorBN,
      adminFeeBN
    ]);
    const constructorData = encodeAbiParameters(
      parseAbiParameters("address,address,address,address,string,string,uint256,uint256"),
      [
        config.underlying,
        config.comptroller,
        config.feeDistributor,
        config.interestRateModel,
        config.name,
        config.symbol,
        reserveFactorBN,
        adminFeeBN
      ]
    );
    console.log("constructorData", constructorData);

    const owner = (await comptroller.read.admin()) as Address;
    // Test Transaction
    const errorCode = await comptroller.simulate._deployMarket(
      [delegateType, constructorData, implementationData, collateralFactorBN],
      { account: owner }
    );
    if (errorCode.result !== 0n) {
      throw `Unable to _deployMarket: ${errorCode.result}`;
    }
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: comptroller,
        functionName: "_deployMarket",
        args: [delegateType, constructorData, implementationData, collateralFactorBN],
        description: `Deploy market for ${config.underlying}`,
        inputs: [
          { internalType: "uint8", name: "delegateType", type: "uint8" },
          { internalType: "bytes", name: "constructorData", type: "bytes" },
          { internalType: "bytes", name: "implementationData", type: "bytes" },
          { internalType: "uint256", name: "collateralFactor", type: "uint256" }
        ]
      });
    } else {
      // Make actual Transaction
      const tx = await comptroller.write._deployMarket([
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      ]);
      console.log("tx", tx);

      // Recreate Address of Deployed Market
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      if (receipt.status !== "success") {
        throw `Failed to deploy market for ${config.underlying}`;
      }
    }
  });

task("market:deploy-morpho-bribe-distributor", "Deploy MorphoBribeDistributor")
  .addParam("morphoMarket", "Address of the Morpho market", undefined, types.string)
  .addParam("morphoBribes", "Address of the Morpho bribes", undefined, types.string)
  .setAction(async (taskArgs, { deployments, getNamedAccounts, viem }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const morphoBribeDistributorDeployment = await deployments.deploy("MorphoBribeDistributor", {
      contract: "MorphoBribeDistributor",
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [taskArgs.morphoMarket, taskArgs.morphoBribes]
          }
        },
        owner: deployer
      },
      log: true,
      waitConfirmations: 1
    });

    console.log("MorphoBribeDistributor deployed at:", morphoBribeDistributorDeployment.address);

    // Verify the deployment
    if (morphoBribeDistributorDeployment.transactionHash) {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: morphoBribeDistributorDeployment.transactionHash as `0x${string}`
      });
      if (receipt.status !== "success") {
        throw `Failed to deploy MorphoBribeDistributor for ${taskArgs.morphoMarket}`;
      }
    }
  });

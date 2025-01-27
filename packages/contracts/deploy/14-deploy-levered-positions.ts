import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, zeroAddress } from "viem";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { prepareAndLogTransaction } from "../chainDeploy/helpers/logging";
import { chainIdtoChain } from "@ionicprotocol/chains";

const LIFI_SWAP_ROUTER = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  let tx: Hash;
  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  const liquidatorsRegistry = await viem.getContractAt(
    "LiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  //// LEVERED POSITIONS FACTORY
  const lpfDep = await deployments.deploy("LeveredPositionFactory", {
    from: deployer,
    log: true,
    args: [fuseFeeDistributor.address, liquidatorsRegistry.address, chainDeployParams.blocksPerYear],
    waitConfirmations: 1,
    skipIfAlreadyDeployed: true
  });

  if (lpfDep.transactionHash) await publicClient.waitForTransactionReceipt({ hash: lpfDep.transactionHash as Hash });
  console.log("LeveredPositionFactory: ", lpfDep.address);

  const lpfExt1Dep = await deployments.deploy("LeveredPositionFactoryFirstExtension", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (lpfExt1Dep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: lpfExt1Dep.transactionHash as Hash });
  console.log("LeveredPositionFactoryFirstExtension: ", lpfExt1Dep.address);

  const lpfExt2Dep = await deployments.deploy("LeveredPositionFactorySecondExtension", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (lpfExt2Dep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: lpfExt2Dep.transactionHash as Hash });
  console.log("LeveredPositionFactorySecondExtension: ", lpfExt2Dep.address);

  const lpfExt3Dep = await deployments.deploy("LeveredPositionFactoryThirdExtension", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (lpfExt3Dep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: lpfExt3Dep.transactionHash as Hash });
  console.log("LeveredPositionFactoryThirdExtension: ", lpfExt3Dep.address);

  const leveredPositionFactory = await viem.getContractAt(
    "LeveredPositionFactory",
    (await deployments.get("LeveredPositionFactory")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  const currentLPFExtensions = await leveredPositionFactory.read._listExtensions();

  console.log("currentLPFExtensions: ", currentLPFExtensions.join(", "));

  if (currentLPFExtensions.length == 1) {
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt1Dep.address as Address, currentLPFExtensions[0]],
        description: "Replace LeveredPositionFactory First Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([
        lpfExt1Dep.address as Address,
        currentLPFExtensions[0]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("replaced the LeveredPositionFactory first extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt2Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory Second Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt2Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory second extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt3Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory Third Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt3Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory third extension: ", tx);
    }
  } else if (currentLPFExtensions.length == 2) {
    if (lpfExt1Dep.address.toLowerCase() != currentLPFExtensions[0].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[0]} with ${lpfExt1Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: leveredPositionFactory,
          functionName: "_registerExtension",
          args: [lpfExt1Dep.address as Address, currentLPFExtensions[0]],
          description: "Replace LeveredPositionFactory First Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt1Dep.address as Address,
          currentLPFExtensions[0]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory first extension: ", tx);
      }
    }
    if (lpfExt2Dep.address.toLowerCase() != currentLPFExtensions[1].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[1]} with ${lpfExt2Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: leveredPositionFactory,
          functionName: "_registerExtension",
          args: [lpfExt2Dep.address as Address, currentLPFExtensions[1]],
          description: "Replace LeveredPositionFactory Second Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt2Dep.address as Address,
          currentLPFExtensions[1]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory second extension: ", tx);
      }
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt3Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory Third Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt3Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory third extension: ", tx);
    }
  } else if (currentLPFExtensions.length == 3) {
    if (lpfExt1Dep.address.toLowerCase() != currentLPFExtensions[0].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[0]} with ${lpfExt1Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: leveredPositionFactory,
          functionName: "_registerExtension",
          args: [lpfExt1Dep.address as Address, currentLPFExtensions[0]],
          description: "Replace LeveredPositionFactory First Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt1Dep.address as Address,
          currentLPFExtensions[0]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory first extension: ", tx);
      }
    }
    if (lpfExt2Dep.address.toLowerCase() != currentLPFExtensions[1].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[1]} with ${lpfExt2Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: leveredPositionFactory,
          functionName: "_registerExtension",
          args: [lpfExt2Dep.address as Address, currentLPFExtensions[1]],
          description: "Replace LeveredPositionFactory Second Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt2Dep.address as Address,
          currentLPFExtensions[1]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory second extension: ", tx);
      }
    }
    if (lpfExt3Dep.address.toLowerCase() != currentLPFExtensions[2].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[2]} with ${lpfExt3Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: leveredPositionFactory,
          functionName: "_registerExtension",
          args: [lpfExt3Dep.address as Address, currentLPFExtensions[2]],
          description: "Replace LeveredPositionFactory Third Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt3Dep.address as Address,
          currentLPFExtensions[2]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory third extension: ", tx);
      }
    }
  } else if (currentLPFExtensions.length == 0) {
    console.log(`no LeveredPositionFactory extensions configured, adding them`);
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt1Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory First Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt1Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory first extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt2Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory Second Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt2Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory second extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_registerExtension",
        args: [lpfExt3Dep.address as Address, zeroAddress],
        description: "Register LeveredPositionFactory Third Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt3Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory third extension: ", tx);
    }
  } else {
    console.log(`no LeveredPositionFactory extensions to update`);
  }

  const lr = await leveredPositionFactory.read.liquidatorsRegistry();
  if (lr.toLowerCase() != liquidatorsRegistry.address.toLowerCase()) {
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: leveredPositionFactory,
        functionName: "_setLiquidatorsRegistry",
        args: [liquidatorsRegistry.address],
        description: "Set LiquidatorsRegistry Address",
        inputs: [{ internalType: "address", name: "liquidatorsRegistry", type: "address" }]
      });
    } else {
      tx = await leveredPositionFactory.write._setLiquidatorsRegistry([liquidatorsRegistry.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("updated the LiquidatorsRegistry address in the LeveredPositionFactory", tx);
    }
  }

  //// LEVERED POSITIONS LENS
  try {
    const lpLens = await deployments.deploy("LeveredPositionsLens", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
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
        owner: multisig ?? deployer
      },
      skipIfAlreadyDeployed: true
    });
    if (lpLens.transactionHash) await publicClient.waitForTransactionReceipt({ hash: lpLens.transactionHash as Hash });
    console.log("LeveredPositionsLens: ", lpLens.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  const factory = await viem.getContractAt("ILeveredPositionFactory", leveredPositionFactory.address);
  const isWhitelisted = await factory.read.isSwapRoutersWhitelisted([LIFI_SWAP_ROUTER]);
  console.log("isWhitelisted: ", isWhitelisted);
  if (!isWhitelisted) {
    const owner = await factory.read.owner();
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: factory,
        functionName: "_setWhitelistedSwapRouters",
        args: [[LIFI_SWAP_ROUTER]],
        description: "Whitelist LIFI Swap Router",
        inputs: [{ internalType: "address[]", name: "swapRouters", type: "address[]" }]
      });
    } else {
      tx = await factory.write._setWhitelistedSwapRouters([[LIFI_SWAP_ROUTER]]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("whitelisted the LIFI Swap Router in the LeveredPositionFactory", tx);
    }
  }
  //// AUTHORITIES REGISTRY
  try {
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
        owner: multisig
      },
      waitConfirmations: 1
    });
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  const authoritiesRegistry = await viem.getContractAt(
    "AuthoritiesRegistry",
    (await deployments.get("AuthoritiesRegistry")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  const ffdAuthRegistry = await fuseFeeDistributor.read.authoritiesRegistry();
  if (ffdAuthRegistry.toLowerCase() != authoritiesRegistry.address.toLowerCase()) {
    // set the address in the FFD
    if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: fuseFeeDistributor,
        functionName: "reinitialize",
        args: [authoritiesRegistry.address],
        description: "Set AuthoritiesRegistry in FeeDistributor",
        inputs: [{ internalType: "address", name: "authoritiesRegistry", type: "address" }]
      });
    } else {
      tx = await fuseFeeDistributor.write.reinitialize([authoritiesRegistry.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the auth registry in the FFD`);
    }
  }
  const leveredPosFactoryAr = await authoritiesRegistry.read.leveredPositionsFactory();
  if (leveredPosFactoryAr.toLowerCase() != leveredPositionFactory.address.toLowerCase()) {
    // set the address in the AR
    if ((await authoritiesRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: authoritiesRegistry,
        functionName: "reinitialize",
        args: [leveredPositionFactory.address],
        description: "Set LeveredPositionsFactory in AuthoritiesRegistry",
        inputs: [{ internalType: "address", name: "leveredPositionsFactory", type: "address" }]
      });
    } else {
      tx = await authoritiesRegistry.write.reinitialize([leveredPositionFactory.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the levered positions factory in the auth registry`, tx);
    }
  }
  ////
};

func.tags = ["prod", "deploy-levered-positions"];

export default func;

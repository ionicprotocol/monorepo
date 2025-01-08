import { DeployFunction } from "hardhat-deploy/types";
import { Address, fromBytes, pad, toBytes, Hash, parseEther } from "viem";
import { base, bob, fraxtal, mode, optimism } from "viem/chains";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { veIONConfig } from "../chainDeploy";

import { logTransaction, prepareAndLogTransaction } from "../chainDeploy/helpers/logging";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const chainId = parseInt(await getChainId());
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  const veParams: veIONConfig = chainDeployParams.veION;

  console.log("chainId: ", chainId);
  console.log("veParams:", veParams);

  const veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);

  let hash;
  const poolDirectoryAddress: Address = "0xPoolDirectoryAddress";
  const protocolAddress: Address = "0xProtocolAddress";
  const rewardTokenAddress: Address = "0xRewardTokenAddress";
  const collateralBp: number = 2500;
  const nonBlacklistableBytecode: string = "0x...";

  let emissionsManager;
  try {
    console.log("Deploying EmissionsManager...");

    emissionsManager = await deployments.deploy("EmissionsManager", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [poolDirectoryAddress, protocolAddress, rewardTokenAddress, collateralBp, nonBlacklistableBytecode]
          }
        }
      }
    });

    console.log(`EmissionsManager deployed at: ${emissionsManager.address}`);
  } catch (error) {
    console.error("Error deploying EmissionsManager:", error);
  }

  emissionsManager = await viem.getContractAt(
    "EmissionsManager",
    (await deployments.get("EmissionsManager")).address as Address
  );

  // ╔══════════════════════════════════════════╗
  // ║      SET VEION ON EMISSIONS MANAGER      ║
  // ╚══════════════════════════════════════════╝
  try {
    const txHash = await emissionsManager.write.setVoter([veION.address], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`Successfully set voter: ${veION.address}`);
  } catch (error) {
    console.error("Error setting voter:", error);
  }
};

func.tags = ["prod", "veion", "emissions-manager"];

export default func;

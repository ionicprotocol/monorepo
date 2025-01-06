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

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  const veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);

  // ╔══════════════════════════════════════════╗
  // ║               DEPLOY VOTER               ║
  // ╚══════════════════════════════════════════╝
  let hash;
  let voter;
  try {
    voter = await deployments.deploy("Voter", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [[chainDeployParams.ION], mpo, chainDeployParams.ION, veION]
          }
        },
        owner: multisig
      }
    });
    if (voter.transactionHash) await publicClient.waitForTransactionReceipt({ hash: voter.transactionHash as Hash });
    console.log("voter: ", veION.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);

  // ╔══════════════════════════════════════════╗
  // ║               SET LP ARRAY               ║
  // ║  Configuring which LP tokens are allowed ║
  // ╚══════════════════════════════════════════╝
  const owner = (await voter.read.owner()) as Address;
  if (owner.toLowerCase() !== deployer.toLowerCase()) {
    await prepareAndLogTransaction({
      contractInstance: voter,
      functionName: "setLpTokens",
      args: [veParams.lpTokens],
      description: "Set LP Tokens",
      inputs: [{ internalType: "address[]", name: "_lpTokens", type: "address[]" }]
    });
  } else {
    hash = await voter.write.setLpTokens([veParams.lpTokens], {
      from: deployer
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );

  // ╔══════════════════════════════════════════╗
  // ║               ADD MARKETS                ║
  // ║  Configuring which LP tokens are allowed ║
  // ╚══════════════════════════════════════════╝
  const allMarkets: { marketAddress: Address; side: number }[] = [];
  const [, pools] = await poolDirectory.read.getActivePools();
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    try {
      const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller);
      const markets = await comptroller.read.getAllMarkets();
      for (const market of markets) {
        allMarkets.push({ marketAddress: market, side: 0 });
        allMarkets.push({ marketAddress: market, side: 1 });
      }
    } catch (error) {
      console.error(`Error processing pool ${pool.name}:`, error);
    }
  }

  try {
    hash = await voter.write.addMarkets([allMarkets], {
      from: deployer
    });
    await publicClient.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.error(`Error adding markets`);
  }
};

func.tags = ["prod", "voter"];

export default func;

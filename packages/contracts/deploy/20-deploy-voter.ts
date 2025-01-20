import { DeployFunction } from "hardhat-deploy/types";
import { Address, fromBytes, pad, toBytes, Hash, parseEther, Hex } from "viem";
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
            args: [[chainDeployParams.ION], mpo.address, chainDeployParams.ION, veION.address]
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
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      console.log(`Successfully set LP Tokens to: ${veParams.lpTokens}`);
    } else {
      console.error(`Transaction ${hash} failed: ${receipt.status}`);
    }
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
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      console.log(`Successfully set markets for: ${allMarkets}`);
    } else {
      console.error(`Transaction ${hash} failed: ${receipt.status}`);
    }
  } catch (error) {
    console.error(`Error adding markets`);
  }

  // ╔══════════════════════════════════════════╗
  // ║     DEPLOY REWARD ACCUMULATORS           ║
  // ║  AND SET THEM IN THE VOTER CONTRACT      ║
  // ╚══════════════════════════════════════════╝

  const rewardAccumulators: Address[] = [];
  const marketAddresses: Address[] = [];
  const marketSides: number[] = [];

  // Loop through allMarkets to deploy a RewardAccumulator for each market and configure it
  for (const market of allMarkets) {
    try {
      // Deploy RewardAccumulator
      const rewardAccumulatorDeployment = await deployments.deploy("RewardAccumulator", {
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: []
            }
          },
          owner: multisig
        }
      });

      if (rewardAccumulatorDeployment.transactionHash) {
        await publicClient.waitForTransactionReceipt({ hash: rewardAccumulatorDeployment.transactionHash as Hash });
      }
      console.log(`Deployed RewardAccumulator at: ${rewardAccumulatorDeployment.address}`);

      // Collect data for setMarketRewardAccumulators
      rewardAccumulators.push(rewardAccumulatorDeployment.address as Hex);
      marketAddresses.push(market.marketAddress);
      marketSides.push(market.side);
    } catch (error) {
      console.error(
        `Error deploying RewardAccumulator for market: ${market.marketAddress}, side: ${market.side}`,
        error
      );
    }
  }

  // Call setMarketRewardAccumulators in the IVoter contract
  try {
    const txHash = await voter.write.setMarketRewardAccumulators([marketAddresses, marketSides, rewardAccumulators], {
      from: deployer
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(
      `Successfully set market reward accumulators ${marketAddresses}, ${marketSides}, ${rewardAccumulators}`
    );
  } catch (error) {
    console.error("Error setting market reward accumulators:", error);
  }

  // ╔══════════════════════════════════════════╗
  // ║       DEPLOY BRIBES AND SET MAPPINGS     ║
  // ╚══════════════════════════════════════════╝

  const bribes: Address[] = []; // To store deployed BribeRewards addresses

  for (const rewardAccumulator of rewardAccumulators) {
    try {
      // Deploy BribeRewards contract
      const bribeDeployment = await deployments.deploy("BribeRewards", {
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [voter.address, veION.address] // Replace `voter` and `veION` with actual instances
            }
          },
          owner: multisig
        }
      });

      if (bribeDeployment.transactionHash) {
        await publicClient.waitForTransactionReceipt({ hash: bribeDeployment.transactionHash as Hash });
      }

      console.log(`Deployed BribeRewards at: ${bribeDeployment.address}`);
      bribes.push(bribeDeployment.address as Hex);
    } catch (error) {
      console.error(`Error deploying BribeRewards for RewardAccumulator: ${rewardAccumulator}`, error);
    }
  }

  try {
    const txHash = await voter.write.setBribes([rewardAccumulators, bribes], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`Successfully set bribes for RewardAccumulators. ${rewardAccumulators}, ${bribes}`);
  } catch (error) {
    console.error("Error setting bribes in Voter contract:", error);
  }

  // ╔══════════════════════════════════════════╗
  // ║           SET MAX VOTING NUM             ║
  // ╚══════════════════════════════════════════╝
  try {
    const txHash = await voter.write.setMaxVotingNum([BigInt(veParams.maxVotingNum)], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`Successfully set max voting number to: ${veParams.maxVotingNum}`);
  } catch (error) {
    console.error("Error setting max voting number:", error);
  }

  const IveION = await viem.getContractAt("IveION", (await deployments.get("veION")).address as Address);

  // ╔══════════════════════════════════════════╗
  // ║           SET VOTER ON VEION             ║
  // ╚══════════════════════════════════════════╝
  try {
    const txHash = await IveION.write.setVoter([voter.address], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`Successfully set voter: ${voter.address}`);
  } catch (error) {
    console.error("Error setting voter:", error);
  }
};

func.tags = ["prod", "veion", "voter"];

export default func;

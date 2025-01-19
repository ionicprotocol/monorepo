import { DeployFunction } from "hardhat-deploy/types";
import { Address, fromBytes, pad, toBytes, Hash, parseEther } from "viem";
import { base, bob, fraxtal, mode, optimism } from "viem/chains";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { veIONConfig } from "../chainDeploy";

import { logTransaction, prepareAndLogTransaction } from "../chainDeploy/helpers/logging";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("Deploy script started!");

  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  //   await publicClient.request({
  //     method: 'evm_mine',
  //     params: [],
  // });

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log(chainDeployParams);

  const veParams: veIONConfig = chainDeployParams.veION;
  // console.log("veParams:", veParams);

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  console.log(addressesProvider.address);

  const veIONFirstExtension = await deployments.deploy("veIONFirstExtension", {
    from: deployer,
    log: true,
    args: [addressesProvider.address]
  });

  if (veIONFirstExtension.transactionHash) {
    await publicClient.waitForTransactionReceipt({ hash: veIONFirstExtension.transactionHash as Hash });
  }
  console.log("veIONFirstExtension: ", veIONFirstExtension.address);

  // // ╔══════════════════════════════════════════╗
  // // ║               DEPLOY VEION               ║
  // // ╚══════════════════════════════════════════╝
  // let hash;
  // let veION;
  // try {
  //   veION = await deployments.deploy("veION", {
  //     from: deployer,
  //     log: true,
  //     proxy: {
  //       proxyContract: "OpenZeppelinTransparentProxy",
  //       execute: {
  //         init: {
  //           methodName: "initialize",
  //           args: [addressesProvider.address]
  //         }
  //       }
  //       // owner: multisig
  //     }
  //   });
  //   if (veION.transactionHash) await publicClient.waitForTransactionReceipt({ hash: veION.transactionHash as Hash });
  //   console.log("veION: ", veION.address);
  // } catch (error) {
  //   console.error("Could not deploy:", error);
  // }

  // let rewardAccumulator;
  // try {
  //   rewardAccumulator = await deployments.deploy("RewardAccumulator", {
  //     from: deployer,
  //     log: true,
  //     proxy: {
  //       proxyContract: "OpenZeppelinTransparentProxy",
  //       execute: {
  //         init: {
  //           methodName: "initialize",
  //           args: []
  //         }
  //       }
  //       // owner: multisig
  //     }
  //   });
  //   if (rewardAccumulator.transactionHash)
  //     await publicClient.waitForTransactionReceipt({ hash: rewardAccumulator.transactionHash as Hash });
  //   console.log("rewardAccumulator: ", rewardAccumulator.address);
  // } catch (error) {
  //   console.error("Could not deploy:", error);
  // }

  // veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);

  // // ╔══════════════════════════════════════════╗
  // // ║            SET LP WHITELIST              ║
  // // ║  Configuring which LP tokens are allowed ║
  // // ╚══════════════════════════════════════════╝
  // const owner = (await veION.read.owner()) as Address;
  // if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //   await prepareAndLogTransaction({
  //     contractInstance: veION,
  //     functionName: "whitelistTokens",
  //     args: [veParams.lpTokens, veParams.lpTokenWhitelistStatuses],
  //     description: "Set Whitelisted Tokens",
  //     inputs: [
  //       { internalType: "address[]", name: "_tokens", type: "address[]" },
  //       { internalType: "bool[]", name: "_isWhitelisted", type: "bool[]" }
  //     ]
  //   });
  // } else {
  //   hash = await veION.write.whitelistTokens([veParams.lpTokens, veParams.lpTokenWhitelistStatuses], {
  //     from: deployer
  //   });
  //   await publicClient.waitForTransactionReceipt({ hash });
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║            SET LP MINIMUM LOCKS          ║
  // // ║  Configuring which LP tokens are allowed ║
  // // ╚══════════════════════════════════════════╝
  // for (let i = 0; i < veParams.lpTokens.length; i++) {
  //   const token = veParams.lpTokens[i];
  //   const minimum = veParams.minimumLockAmounts[i];
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setMinimumLockAmount",
  //       args: [token as Address, minimum],
  //       description: `Set Minimum Lock For Token: ${token}`,
  //       inputs: [
  //         { internalType: "address", name: "_tokenAddress", type: "address" },
  //         { internalType: "uint256", name: "_minimumAmount", type: "uint256" }
  //       ]
  //     });
  //   } else {
  //     hash = await veION.write.setMinimumLockAmount([token, minimum], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET MINIMUM LOCK DURATION       ║
  // // ╚══════════════════════════════════════════╝
  // if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //   await prepareAndLogTransaction({
  //     contractInstance: veION,
  //     functionName: "setMinimumLockDuration",
  //     args: [veParams.minimumLockDuration],
  //     description: `Set Minimum Lock Duration: ${veParams.minimumLockDuration}`,
  //     inputs: [{ internalType: "uint256", name: "_minimumLockDuration", type: "uint256" }]
  //   });
  // } else {
  //   hash = await veION.write.setMinimumLockDuration([veParams.minimumLockDuration], { from: deployer });
  //   await publicClient.waitForTransactionReceipt({ hash });
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET AERO IONIC POOL             ║
  // // ╚══════════════════════════════════════════╝
  // if (veParams.ionicAeroVeloPool) {
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setIonicPool",
  //       args: [veParams.ionicAeroVeloPool],
  //       description: `Set Aero Ionic Pool: ${veParams.ionicAeroVeloPool}`,
  //       inputs: [{ internalType: "address", name: "_ionicPool", type: "address" }]
  //     });
  //   } else {
  //     hash = await veION.write.setIonicPool([veParams.ionicAeroVeloPool], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET AERO VOTER                  ║
  // // ╚══════════════════════════════════════════╝
  // if (veParams.aeroVoting) {
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setAeroVoting",
  //       args: [veParams.aeroVoting],
  //       description: `Set Aero Voting: ${veParams.aeroVoting}`,
  //       inputs: [{ internalType: "address", name: "_aeroVoting", type: "address" }]
  //     });
  //   } else {
  //     hash = await veION.write.setAeroVoting([veParams.aeroVoting], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET AERO VOTER BOOST            ║
  // // ╚══════════════════════════════════════════╝
  // if (veParams.aeroVotingBoost) {
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setAeroVoting",
  //       args: [veParams.aeroVoting],
  //       description: `Set Aero Voting Boost: ${veParams.aeroVoting}`,
  //       inputs: [{ internalType: "uint256", name: "_aeroVoterBoost", type: "uint256" }]
  //     });
  //   } else {
  //     hash = await veION.write.setAeroVoting([veParams.aeroVoting], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET MAX EARLY WITHDRAW FEE      ║
  // // ╚══════════════════════════════════════════╝
  // if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //   await prepareAndLogTransaction({
  //     contractInstance: veION,
  //     functionName: "setMaxEarlyWithdrawFee",
  //     args: [veParams.maxEarlyWithdrawFee],
  //     description: `Set Max Early Withdraw Fee: ${veParams.maxEarlyWithdrawFee}`,
  //     inputs: [{ internalType: "uint256", name: "_maxEarlyWithdrawFee", type: "uint256" }]
  //   });
  // } else {
  //   hash = await veION.write.setMaxEarlyWithdrawFee([veParams.maxEarlyWithdrawFee], { from: deployer });
  //   await publicClient.waitForTransactionReceipt({ hash });
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET LP TOKEN TYPE               ║
  // // ╚══════════════════════════════════════════╝
  // for (let i = 0; i < veParams.lpTokens.length; i++) {
  //   const token = veParams.lpTokens[i];
  //   const type = veParams.lpTokenTypes[i];
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setLpTokenType",
  //       args: [token, type],
  //       description: `Set LP Token Type: ${token} to ${type}`,
  //       inputs: [
  //         { internalType: "address", name: "_token", type: "address" },
  //         { internalType: "uint8", name: "_type", type: "uint8" }
  //       ]
  //     });
  //   } else {
  //     hash = await veION.write.setLpTokenType([token, type], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET VEAERO                      ║
  // // ╚══════════════════════════════════════════╝
  // for (let i = 0; i < veParams.lpTokens.length; i++) {
  //   if (owner.toLowerCase() !== deployer.toLowerCase()) {
  //     await prepareAndLogTransaction({
  //       contractInstance: veION,
  //       functionName: "setVeAERO",
  //       args: [veParams.veAERO],
  //       description: `Set veAERO: ${veParams.veAERO}`,
  //       inputs: [{ internalType: "address", name: "_veAERO", type: "address" }]
  //     });
  //   } else {
  //     hash = await veION.write.setVeAERO([veParams.veAERO], { from: deployer });
  //     await publicClient.waitForTransactionReceipt({ hash });
  //   }
  // }

  // let veloAeroStakingWallet;
  // try {
  //   console.log("Deploying VeloAeroStakingWallet implementation...");

  //   veloAeroStakingWallet = await deployments.deploy("VeloAeroStakingWallet", {
  //     from: deployer,
  //     log: true
  //   });

  //   console.log(`VeloAeroStakingWallet deployed at: ${veloAeroStakingWallet.address}`);
  // } catch (error) {
  //   console.error("Error deploying VeloAeroStakingWallet:", error);
  // }

  // // ╔══════════════════════════════════════════╗
  // // ║          SET STAKING STRATEGY            ║
  // // ╚══════════════════════════════════════════╝
  // // Parameters for initialization
  // const stakingTokenAddress: Address = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";
  // const stakingContractAddress: Address = "0x9b42e5F8c45222b2715F804968251c747c588fd7"; // Replace with actual staking contract address
  // const stakingWalletImplementationAddress = veloAeroStakingWallet.address; // Replace with actual staking wallet implementation address
  // let stakeStrategy;
  // try {
  //   stakeStrategy = await deployments.deploy("VeloAeroStakingStrategy", {
  //     from: deployer,
  //     log: true,
  //     proxy: {
  //       proxyContract: "OpenZeppelinTransparentProxy",
  //       execute: {
  //         init: {
  //           methodName: "initialize",
  //           args: [veION.address, stakingTokenAddress, stakingContractAddress, stakingWalletImplementationAddress]
  //         }
  //       },
  //       owner: multisig
  //     }
  //   });

  //   console.log(`VeloAeroStakingStrategy deployed at: ${stakeStrategy.address}`);
  // } catch (error) {
  //   console.error("Error deploying VeloAeroStakingStrategy:", error);
  // }

  // try {
  //   const txHash = await veION.write.setStakeStrategy([2, stakeStrategy.address], { from: deployer });
  //   await publicClient.waitForTransactionReceipt({ hash: txHash });
  //   console.log(`Successfully set max voting number to: ${veParams.maxVotingNum}`);
  // } catch (error) {
  //   console.error("Error setting max voting number:", error);
  // }
};

func.tags = ["prod", "veion", "veion-nft"];

export default func;

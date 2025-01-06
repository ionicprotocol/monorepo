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

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  // ╔══════════════════════════════════════════╗
  // ║               DEPLOY VEION               ║
  // ╚══════════════════════════════════════════╝
  let hash;
  let veION;
  try {
    veION = await deployments.deploy("veION", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [addressesProvider.address]
          }
        },
        owner: multisig
      }
    });
    if (veION.transactionHash) await publicClient.waitForTransactionReceipt({ hash: veION.transactionHash as Hash });
    console.log("veION: ", veION.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);

  // ╔══════════════════════════════════════════╗
  // ║            SET LP WHITELIST              ║
  // ║  Configuring which LP tokens are allowed ║
  // ╚══════════════════════════════════════════╝
  const owner = (await veION.read.owner()) as Address;
  if (owner.toLowerCase() !== deployer.toLowerCase()) {
    await prepareAndLogTransaction({
      contractInstance: veION,
      functionName: "whitelistTokens",
      args: [veParams.lpTokens, veParams.lpTokenWhitelistStatuses],
      description: "Set Whitelisted Tokens",
      inputs: [
        { internalType: "address[]", name: "_tokens", type: "address[]" },
        { internalType: "bool[]", name: "_isWhitelisted", type: "bool[]" }
      ]
    });
  } else {
    hash = await veION.write.whitelistTokens([veParams.lpTokens, veParams.lpTokenWhitelistStatuses], {
      from: deployer
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  // ╔══════════════════════════════════════════╗
  // ║            SET LP MINIMUM LOCKS          ║
  // ║  Configuring which LP tokens are allowed ║
  // ╚══════════════════════════════════════════╝
  for (let i = 0; i < veParams.lpTokens.length; i++) {
    const token = veParams.lpTokens[i];
    const minimum = veParams.minimumLockAmounts[i];
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setMinimumLockAmount",
        args: [token as Address, minimum],
        description: `Set Minimum Lock For Token: ${token}`,
        inputs: [
          { internalType: "address", name: "_tokenAddress", type: "address" },
          { internalType: "uint256", name: "_minimumAmount", type: "uint256" }
        ]
      });
    } else {
      hash = await veION.write.setMinimumLockAmount([token, minimum], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET MINIMUM LOCK DURATION       ║
  // ╚══════════════════════════════════════════╝
  if (owner.toLowerCase() !== deployer.toLowerCase()) {
    await prepareAndLogTransaction({
      contractInstance: veION,
      functionName: "setMinimumLockDuration",
      args: [veParams.minimumLockDuration],
      description: `Set Minimum Lock Duration: ${veParams.minimumLockDuration}`,
      inputs: [{ internalType: "uint256", name: "_minimumLockDuration", type: "uint256" }]
    });
  } else {
    hash = await veION.write.setMinimumLockDuration([veParams.minimumLockDuration], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET AERO IONIC POOL             ║
  // ╚══════════════════════════════════════════╝
  if (veParams.ionicAeroVeloPool) {
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setIonicPool",
        args: [veParams.ionicAeroVeloPool],
        description: `Set Aero Ionic Pool: ${veParams.ionicAeroVeloPool}`,
        inputs: [{ internalType: "address", name: "_ionicPool", type: "address" }]
      });
    } else {
      hash = await veION.write.setIonicPool([veParams.ionicAeroVeloPool], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET AERO VOTER                  ║
  // ╚══════════════════════════════════════════╝
  if (veParams.aeroVoting) {
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setAeroVoting",
        args: [veParams.aeroVoting],
        description: `Set Aero Voting: ${veParams.aeroVoting}`,
        inputs: [{ internalType: "address", name: "_aeroVoting", type: "address" }]
      });
    } else {
      hash = await veION.write.setAeroVoting([veParams.aeroVoting], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET AERO VOTER BOOST            ║
  // ╚══════════════════════════════════════════╝
  if (veParams.aeroVotingBoost) {
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setAeroVoting",
        args: [veParams.aeroVoting],
        description: `Set Aero Voting Boost: ${veParams.aeroVoting}`,
        inputs: [{ internalType: "uint256", name: "_aeroVoterBoost", type: "uint256" }]
      });
    } else {
      hash = await veION.write.setAeroVoting([veParams.aeroVoting], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET MAX EARLY WITHDRAW FEE      ║
  // ╚══════════════════════════════════════════╝
  if (owner.toLowerCase() !== deployer.toLowerCase()) {
    await prepareAndLogTransaction({
      contractInstance: veION,
      functionName: "setMaxEarlyWithdrawFee",
      args: [veParams.maxEarlyWithdrawFee],
      description: `Set Max Early Withdraw Fee: ${veParams.maxEarlyWithdrawFee}`,
      inputs: [{ internalType: "uint256", name: "_maxEarlyWithdrawFee", type: "uint256" }]
    });
  } else {
    hash = await veION.write.setMaxEarlyWithdrawFee([veParams.maxEarlyWithdrawFee], { from: deployer });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET LP TOKEN TYPE               ║
  // ╚══════════════════════════════════════════╝
  for (let i = 0; i < veParams.lpTokens.length; i++) {
    const token = veParams.lpTokens[i];
    const type = veParams.lpTokenTypes[i];
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setLpTokenType",
        args: [token, type],
        description: `Set LP Token Type: ${token} to ${type}`,
        inputs: [
          { internalType: "address", name: "_token", type: "address" },
          { internalType: "uint8", name: "_type", type: "uint8" }
        ]
      });
    } else {
      hash = await veION.write.setLpTokenType([token, type], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  // ╔══════════════════════════════════════════╗
  // ║          SET VEAERO                      ║
  // ╚══════════════════════════════════════════╝
  for (let i = 0; i < veParams.lpTokens.length; i++) {
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: veION,
        functionName: "setVeAERO",
        args: [veParams.veAERO],
        description: `Set veAERO: ${veParams.veAERO}`,
        inputs: [{ internalType: "address", name: "_veAERO", type: "address" }]
      });
    } else {
      hash = await veION.write.setVeAERO([veParams.veAERO], { from: deployer });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }
};

func.tags = ["prod", "veion"];

export default func;

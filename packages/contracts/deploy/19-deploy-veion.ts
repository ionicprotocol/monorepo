import { DeployFunction } from "hardhat-deploy/types";
import { createWalletClient, Address, Hash, encodeFunctionData, Hex, http } from "viem";
import { base, bob, fraxtal, mode, optimism } from "viem/chains";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { veIONConfig } from "../chainDeploy";

import { privateKeyToAccount } from "viem/accounts";
import { logTransaction, prepareAndLogTransaction } from "../chainDeploy/helpers/logging";
const veIONSecondExtensionArtifact = require("../artifacts/contracts/veION/veIONSecondExtension.sol/veIONSecondExtension.json");

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("Deploy script started!");

  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({});

  // await publicClient.request({
  //   method: "evm_mine",
  //   params: []
  // });

  // const privateKey = process.env.DEPLOYER;
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const account = privateKeyToAccount(privateKey as Hex);

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http("https://base-mainnet.g.alchemy.com/v2/Qas8P5h61iinHB4zz2BKXR9gxk440Ohe")
  });

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log(chainDeployParams);

  const veParams: veIONConfig = chainDeployParams.veION;

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );
  console.log(addressesProvider.address);

  const veIONFirstExtension = await deployments.deploy("veIONFirstExtension", {
    from: deployer,
    log: true
  });
  if (veIONFirstExtension.transactionHash) {
    await publicClient.waitForTransactionReceipt({ hash: veIONFirstExtension.transactionHash as Hash });
  }
  console.log("veION First Extension: ", veIONFirstExtension.address);

  const veIONSecondExtension = await deployments.deploy("veIONSecondExtension", {
    from: deployer,
    log: true
  });
  if (veIONSecondExtension.transactionHash) {
    await publicClient.waitForTransactionReceipt({ hash: veIONSecondExtension.transactionHash as Hash });
  }
  console.log("veION Second Extension: ", veIONSecondExtension.address);

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
        }
        // owner: deployer
      }
    });
    if (veION.transactionHash) await publicClient.waitForTransactionReceipt({ hash: veION.transactionHash as Hash });
    console.log("veION: ", veION.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);

  hash = await veION.write.setExtensions([veIONFirstExtension.address as Hex, veIONSecondExtension.address as Hex], {
    from: deployer
  });
  await publicClient.waitForTransactionReceipt({ hash });

  console.log(`Extensions Set: ${veIONFirstExtension.address}, ${veIONSecondExtension.address}`);
  const IveION = await viem.getContractAt("IveION", (await deployments.get("veION")).address as Address);

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
    hash = await IveION.write.whitelistTokens([veParams.lpTokens, veParams.lpTokenWhitelistStatuses], {
      from: deployer
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      console.log(`Successfully set whitelist [${veParams.lpTokens}], [${veParams.lpTokenWhitelistStatuses}]`);
    } else {
      console.error(`Transaction ${hash} failed: ${receipt.status}`);
    }
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
      hash = await IveION.write.setMinimumLockAmount([token, minimum], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set minimum lock amount for token: ${token}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
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
    hash = await IveION.write.setMinimumLockDuration([BigInt(veParams.minimumLockDuration)], { from: deployer });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      console.log(`Successfully set minimum lock duration for token: ${veParams.minimumLockDuration}`);
    } else {
      console.error(`Transaction ${hash} failed: ${receipt.status}`);
    }
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
      hash = await IveION.write.setIonicPool([veParams.ionicAeroVeloPool], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set Aero Ionic Pool: ${veParams.ionicAeroVeloPool}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
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
      hash = await IveION.write.setAeroVoting([veParams.aeroVoting], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set Aero Voter: ${veParams.aeroVoting}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
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
        description: `Set Aero Voting Boost: ${veParams.aeroVotingBoost}`,
        inputs: [{ internalType: "uint256", name: "_aeroVoterBoost", type: "uint256" }]
      });
    } else {
      hash = await IveION.write.setAeroVoterBoost([veParams.aeroVotingBoost], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set Aero Voter Boost: ${veParams.aeroVotingBoost}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
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
    hash = await IveION.write.setMaxEarlyWithdrawFee([veParams.maxEarlyWithdrawFee], { from: deployer });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "success") {
      console.log(`Successfully set max early withdraw fee: ${veParams.maxEarlyWithdrawFee}`);
    } else {
      console.error(`Transaction ${hash} failed: ${receipt.status}`);
    }
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
      hash = await IveION.write.setLpTokenType([token, type], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set Lp Type: ${token}, ${type}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
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
      hash = await IveION.write.setVeAERO([veParams.veAERO as Hex], { from: deployer });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        console.log(`Successfully set veAERO: ${veParams.veAERO}`);
      } else {
        console.error(`Transaction ${hash} failed: ${receipt.status}`);
      }
    }
  }

  let veloAeroStakingWallet;
  try {
    console.log("Deploying VeloAeroStakingWallet implementation...");

    veloAeroStakingWallet = await deployments.deploy("VeloAeroStakingWallet", {
      from: deployer,
      log: true
    });

    console.log(`VeloAeroStakingWallet deployed at: ${veloAeroStakingWallet.address}`);
  } catch (error) {
    console.error("Error deploying VeloAeroStakingWallet:", error);
  }

  veloAeroStakingWallet = await viem.getContractAt(
    "VeloAeroStakingWallet",
    (await deployments.get("VeloAeroStakingWallet")).address as Address
  );

  // ╔══════════════════════════════════════════╗
  // ║          SET STAKING STRATEGY            ║
  // ╚══════════════════════════════════════════╝
  // Parameters for initialization
  const stakingTokenAddress: Address = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";
  const stakingContractAddress: Address = "0x9b42e5F8c45222b2715F804968251c747c588fd7"; // Replace with actual staking contract address
  const stakingWalletImplementationAddress = veloAeroStakingWallet.address; // Replace with actual staking wallet implementation address
  let stakeStrategy;
  try {
    stakeStrategy = await deployments.deploy("VeloAeroStakingStrategy", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [veION.address, stakingTokenAddress, stakingContractAddress, stakingWalletImplementationAddress]
          }
        },
        owner: multisig
      }
    });

    console.log(`VeloAeroStakingStrategy deployed at: ${stakeStrategy.address}`);
  } catch (error) {
    console.error("Error deploying VeloAeroStakingStrategy:", error);
  }

  stakeStrategy = await viem.getContractAt(
    "VeloAeroStakingStrategy",
    (await deployments.get("VeloAeroStakingStrategy")).address as Address
  );

  const txHash = await IveION.write.setStakeStrategy([2, stakeStrategy.address], { from: deployer });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status === "success") {
    console.log(`Successfully set staking strategy to : ${stakeStrategy.address} for token ${2}`);
  } else {
    console.error(`Transaction ${hash} failed: ${receipt.status}`);
  }
};

func.tags = ["prod", "veion", "veion-nft"];

export default func;

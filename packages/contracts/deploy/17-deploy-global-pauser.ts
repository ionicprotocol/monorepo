import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash } from "viem";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { base, mode, optimism } from "viem/chains";
import { chainIdtoChain } from "@ionicprotocol/chains";

const HYPERNATIVE: Record<number, Address> = {
  [mode.id]: "0xd9677b0eeafdce6bf322d9774bb65b1f42cf0404",
  [base.id]: "0xd9677b0eeafdce6bf322d9774bb65b1f42cf0404",
  [optimism.id]: "0xd9677b0eeafdce6bf322d9774bb65b1f42cf0404"
};

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });

  console.log("multisig: ", multisig);

  console.log("chainId: ", chainId);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  const pauserDeployment = await deployments.deploy("GlobalPauser", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
    args: [poolDirectory.address]
  });
  console.log("pauserDeployment: ", pauserDeployment.address);
  const pauser = await viem.getContractAt("GlobalPauser", pauserDeployment.address as Address, {
    client: { public: publicClient, wallet: walletClient }
  });

  let tx: Hash;
  let isGuardian = await pauser.read.pauseGuardian([deployer as Address]);
  console.log(`isGuardian: ${isGuardian} for ${deployer}`);
  if (!isGuardian) {
    tx = await pauser.write.setPauseGuardian([deployer as Address, true]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`added ${deployer} as pause guardian`);
  }
  const guardian = HYPERNATIVE[chainId] ?? deployer;
  isGuardian = await pauser.read.pauseGuardian([guardian]);
  console.log(`isGuardian: ${isGuardian} for ${guardian}`);
  if (!isGuardian) {
    tx = await pauser.write.setPauseGuardian([guardian, true]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`added ${guardian} as pause guardian`);
  }

  const owner = await pauser.read.owner();
  console.log("owner: ", owner);
  if (multisig && owner.toLowerCase() !== multisig.toLowerCase()) {
    tx = await pauser.write.transferOwnership([multisig as Address]);
    console.log(`transferOwnership to ${multisig}: ${tx}, please accept from multisig`);
  } else {
    console.log("owner is multisig, skipping transferOwnership");
  }
};

func.tags = ["prod", "global-pauser"];

export default func;

import { ContractTransaction } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { GlobalPauser } from "../typechain";

const HYPERNATIVE = "0xd9677b0eeafdce6bf322d9774bb65b1f42cf0404";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer, multisig } = await getNamedAccounts();
  console.log("multisig: ", multisig);

  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const poolDirectory = await ethers.getContract("PoolDirectory", deployer);
  const pauserDeployment = await deployments.deploy("GlobalPauser", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
    args: [poolDirectory.address]
  });
  console.log("pauserDeployment: ", pauserDeployment.address);
  const pauser = (await ethers.getContractAt("GlobalPauser", pauserDeployment.address, deployer)) as GlobalPauser;

  let tx: ContractTransaction;
  let isGuardian = await pauser.pauseGuardian(deployer);
  console.log(`isGuardian: ${isGuardian} for ${deployer}`);
  if (!isGuardian) {
    tx = await pauser.setPauseGuardian(deployer, true);
    await tx.wait();
    console.log(`added ${deployer} as pause guardian`);
  }
  isGuardian = await pauser.pauseGuardian(HYPERNATIVE);
  console.log(`isGuardian: ${isGuardian} for ${HYPERNATIVE}`);
  if (!isGuardian) {
    tx = await pauser.setPauseGuardian(HYPERNATIVE, true);
    await tx.wait();
    console.log(`added ${HYPERNATIVE} as pause guardian`);
  }

  const owner = await pauser.owner();
  console.log("owner: ", owner);
  if (multisig && owner.toLowerCase() !== multisig.toLowerCase()) {
    tx = await pauser.transferOwnership(multisig);
    console.log(`transferOwnership to ${multisig}: ${tx.hash}, please accept from multisig`);
  } else {
    console.log("owner is multisig, skipping transferOwnership");
  }
};

func.tags = ["prod", "global-pauser"];

export default func;

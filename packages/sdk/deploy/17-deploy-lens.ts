import { constants } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const fplDeployment = await deployments.deploy("PoolLens", {
    from: deployer,
    log: true,
    waitConfirmations: 1
  });

  let tx: any;

  if (fplDeployment.transactionHash) await ethers.provider.waitForTransaction(fplDeployment.transactionHash);
  console.log("PoolLens: ", fplDeployment.address);
  const fusePoolLens = await ethers.getContract("PoolLens", deployer);
  let directory = await fusePoolLens.directory();
  if (directory === constants.AddressZero) {
    const fusePoolDirectory = await ethers.getContract("PoolDirectory", deployer);
    tx = await fusePoolLens.initialize(
      fusePoolDirectory.address,
      chainDeployParams.nativeTokenName,
      chainDeployParams.nativeTokenSymbol,
      chainDeployParams.uniswap.hardcoded.map((h) => h.address),
      chainDeployParams.uniswap.hardcoded.map((h) => h.name),
      chainDeployParams.uniswap.hardcoded.map((h) => h.symbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpName),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpSymbol),
      chainDeployParams.uniswap.uniswapData.map((u) => u.lpDisplayName)
    );
    await tx.wait();
    console.log("PoolLens initialized", tx.hash);
  } else {
    console.log("PoolLens already initialized");
  }

  const fpls = await deployments.deploy("PoolLensSecondary", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (fpls.transactionHash) await ethers.provider.waitForTransaction(fpls.transactionHash);
  console.log("PoolLensSecondary: ", fpls.address);

  const fusePoolLensSecondary = await ethers.getContract("PoolLensSecondary", deployer);
  directory = await fusePoolLensSecondary.directory();
  if (directory === constants.AddressZero) {
    const fusePoolDirectory = await ethers.getContract("PoolDirectory", deployer);
    tx = await fusePoolLensSecondary.initialize(fusePoolDirectory.address);
    await tx.wait();
    console.log("PoolLensSecondary initialized", tx.hash);
  } else {
    console.log("PoolLensSecondary already initialized");
  }
};

func.tags = ["prod", "deploy-lens"];

export default func;

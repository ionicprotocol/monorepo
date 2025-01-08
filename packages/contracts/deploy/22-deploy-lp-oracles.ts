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

  try {
    console.log("Deploying UniswapLpTokenPriceOracle...");

    const deployment = await deployments.deploy("UniswapLpTokenPriceOracle", {
      from: deployer,
      args: [chainDeployParams.wtoken],
      log: true
    });

    console.log(`UniswapLpTokenPriceOracle deployed at: ${deployment.address}`);
  } catch (error) {
    console.error("Error deploying UniswapLpTokenPriceOracle:", error);
  }
};

func.tags = ["prod", "veion", "lp-oracle"];

export default func;

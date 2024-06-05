import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const { deployer, multisig } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  console.log("multisig: ", multisig);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("balance: ", balance.toString());
  const price = await ethers.provider.getGasPrice();
  console.log("gas price: ", ethers.utils.formatUnits(price, "gwei"));
  const feeData = await ethers.provider.getFeeData();

  console.log("fee data: ", {
    lastBaseFeePerGas: feeData.lastBaseFeePerGas?.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    gasPrice: feeData.gasPrice?.toString()
  });

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams, deployFunc }: { config: ChainDeployConfig; deployFunc: any } =
    chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  //// CHAIN SPECIFIC DEPLOYMENT
  console.log("Running deployment for chain: ", chainId);
  if (deployFunc) {
    await deployFunc({ run, ethers, getNamedAccounts, deployments });
  }
};

func.tags = ["prod", "chain-deploy"];

export default func;

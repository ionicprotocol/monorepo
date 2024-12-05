import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);
  const oracleRegistry = await deployments.deploy("OracleRegistry", {
    from: deployer,
    log: true,
    waitConfirmations: 1
  });
  console.log("OracleRegistry deployed to: ", oracleRegistry.address);
};

func.tags = ["prod", "security-oracle"];
export default func;

import { JarvisLiquidatorFunderDeployParams } from "../types";

export const deployJarvisLiquidatorFunder = async ({
  ethers,
  getNamedAccounts,
  deployments,
}: JarvisLiquidatorFunderDeployParams) => {
  const { deployer } = await getNamedAccounts();

  const jarvisLiquidatorFunder = await deployments.deploy("JarvisLiquidatorFunder", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (jarvisLiquidatorFunder.transactionHash)
    await ethers.provider.waitForTransaction(jarvisLiquidatorFunder.transactionHash);
  console.log("JarvisLiquidatorFunder: ", jarvisLiquidatorFunder.address);
};

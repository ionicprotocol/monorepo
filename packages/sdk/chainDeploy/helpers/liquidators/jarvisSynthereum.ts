import { JarvisSynthereumLiquidatorDeployParams } from "../types";

export const deployJarvisSynthereumLiquidator = async ({
  ethers,
  getNamedAccounts,
  deployments,
  jarvisLiquidityPools,
}: JarvisSynthereumLiquidatorDeployParams) => {
  const { deployer } = await getNamedAccounts();

  const addresses = jarvisLiquidityPools.map((j) => j.liquidityPoolAddress);
  const expirations = jarvisLiquidityPools.map((j) => j.expirationTime);
  const jarvisSynthereumLiquidator = await deployments.deploy("JarvisSynthereumLiquidator", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [addresses, expirations],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
  });
  if (jarvisSynthereumLiquidator.transactionHash)
    await ethers.provider.waitForTransaction(jarvisSynthereumLiquidator.transactionHash);
  console.log("JarvisSynthereumLiquidator: ", jarvisSynthereumLiquidator.address);
};

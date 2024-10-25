import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "viem";

const lifiSwapTarget = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );

  const [, pools] = await poolDirectory.read.getActivePools();
  for (const [id, pool] of pools.entries()) {
    console.log("pool: ", pool);
    const swap = await deployments.deploy(`CollateralSwap-${pool.comptroller}`, {
      contract: "CollateralSwap",
      from: deployer,
      args: [0n, deployer, pool.comptroller, [lifiSwapTarget]],
      log: true
    });
    console.log("swap deployed at: ", swap.address);
  }
};

func.tags = ["prod", "collateral-swap"];

export default func;

import { providers } from "ethers";

import { BalancerLpFnParams } from "../types";

export const deployBalancerLpPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerLpAssets,
}: BalancerLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const blpo = await deployments.deploy("BalancerLpTokenPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [mpo.address],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (blpo.transactionHash) await ethers.provider.waitForTransaction(blpo.transactionHash);
  console.log("BalancerLpTokenPriceOracle: ", blpo.address);

  const underlyings = balancerLpAssets.map((d) => d.lpTokenAddress);
  const oracles = Array(balancerLpAssets.length).fill(blpo.address);

  const tx: providers.TransactionResponse = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};

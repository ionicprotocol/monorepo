import { providers } from "ethers";

import { BalancerLpFnParams, BalancerStableLpFnParams } from "../types";

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

export const deployBalancerStableLpPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerStableLpAssets,
}: BalancerStableLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const blpso = await deployments.deploy("BalancerLpStablePoolPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [balancerStableLpAssets.map((d) => d.lpTokenAddress), balancerStableLpAssets.map((d) => d.baseToken)],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (blpso.transactionHash) await ethers.provider.waitForTransaction(blpso.transactionHash);
  console.log("BalancerLpStablePoolPriceOracle: ", blpso.address);

  const blpOracle = await ethers.getContract("BalancerLpStablePoolPriceOracle", deployer);
  const registeredLpTokens = await blpOracle.getAllLpTokens();

  for (const lpToken of balancerStableLpAssets) {
    if (!registeredLpTokens.includes(lpToken.lpTokenAddress)) {
      const tx: providers.TransactionResponse = await blpOracle.registerLpToken(
        lpToken.lpTokenAddress,
        lpToken.baseToken
      );
      await tx.wait();
      console.log(
        `BalancerLpStablePoolPriceOracle registered for token ${lpToken} with base token: ${lpToken.baseToken}`
      );
    }
  }

  const underlyings = balancerStableLpAssets.map((d) => d.lpTokenAddress);
  const oracles = Array(balancerStableLpAssets.length).fill(blpso.address);

  const tx: providers.TransactionResponse = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};

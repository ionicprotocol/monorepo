import { constants, providers } from "ethers";

import { SaddleLpFnParams } from "../types";

export const deploySaddleLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  saddlePools,
}: SaddleLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  //// SaddleLpPriceOracle
  const spo = await deployments.deploy("SaddleLpPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [[], [], []],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (spo.transactionHash) await ethers.provider.waitForTransaction(spo.transactionHash);
  console.log("SaddleLpPriceOracle: ", spo.address);

  const saddleLpOracle = await ethers.getContract("SaddleLpPriceOracle", deployer);

  for (const pool of saddlePools) {
    const registered = await saddleLpOracle.poolOf(pool.lpToken);

    if (registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }

    tx = await saddleLpOracle.registerPool(pool.lpToken, pool.pool, pool.underlyings);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

  const underlyings = saddlePools.map((c) => c.lpToken);
  const oracles = Array(saddlePools.length).fill(saddleLpOracle.address);

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};

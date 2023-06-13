import { constants, providers } from "ethers";

import { CurveV2OracleLpFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployCurveV2Oracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  curveV2OraclePools,
}: CurveV2OracleLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// CurveV2PriceOracle
  const cpo = await deployments.deploy("CurveV2PriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [curveV2OraclePools.map((c) => c.token), curveV2OraclePools.map((c) => c.pool)],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("CurveV2PriceOracle: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveV2PriceOracle", deployer);

  for (const pool of curveV2OraclePools) {
    const registered = await curveOracle.poolFor(pool.token);

    if (registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }

    tx = await curveOracle.registerPool(pool.token, pool.pool);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

  const underlyings = curveV2OraclePools.map((c) => c.token);
  await addUnderlyingsToMpo(mpo, underlyings, curveOracle.address);
};

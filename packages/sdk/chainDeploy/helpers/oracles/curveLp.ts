import { constants, providers } from "ethers";

import { CurveLpFnParams, CurveV2LpFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployCurveLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  curvePools
}: CurveLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  //// CurveLpTokenPriceOracleNoRegistry
  const cpo = await deployments.deploy("CurveLpTokenPriceOracleNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [[], [], []]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("CurveLpTokenPriceOracleNoRegistry: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);

  for (const pool of curvePools) {
    const registered = await curveOracle.poolOf(pool.lpToken);

    if (registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }

    tx = await curveOracle.registerPool(pool.lpToken, pool.pool, pool.underlyings);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

  const underlyings = curvePools.map((c) => c.lpToken);
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  await addUnderlyingsToMpo(mpo, underlyings, curveOracle.address);
};

export const deployCurveV2LpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  curveV2Pools
}: CurveV2LpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// CurveLpTokenPriceOracleNoRegistry
  const cpo = await deployments.deploy("CurveV2LpTokenPriceOracleNoRegistry", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [[], []]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("CurveV2LpTokenPriceOracleNoRegistry: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveV2LpTokenPriceOracleNoRegistry", deployer);

  for (const pool of curveV2Pools) {
    const registered = await curveOracle.poolOf(pool.lpToken);

    if (registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }

    tx = await curveOracle.registerPool(pool.lpToken, pool.pool);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

  const underlyings = curveV2Pools.map((c) => c.lpToken);
  await addUnderlyingsToMpo(mpo, underlyings, curveOracle.address);
};

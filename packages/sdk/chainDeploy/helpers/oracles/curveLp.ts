import { constants, providers } from "ethers";

import { CurveLpFnParams } from "../types";

export const deployCurveLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  curvePools,
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
          args: [[], [], []],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("CurveLpTokenPriceOracleNoRegistry: ", cpo.address);

  const curveOracle = await ethers.getContract("CurveLpTokenPriceOracleNoRegistry", deployer);

  for (const pool of curvePools) {
    const registered = await curveOracle.poolOf(pool.lpToken);

    // TODO revert temporary fix
    const isWrongPool =
      pool.lpToken === "0x8087a94FFE6bcF08DC4b4EBB3d28B4Ed75a792aC" &&
      registered === "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d";
    if (!isWrongPool && registered !== constants.AddressZero) {
      console.log("Pool already registered", pool);
      continue;
    }
    tx = await curveOracle.registerPool(pool.lpToken, pool.pool, pool.underlyings);
    console.log("registerPool sent: ", tx.hash);
    receipt = await tx.wait();
    console.log("registerPool mined: ", receipt.transactionHash);
  }

  const underlyings = curvePools.map((c) => c.lpToken);
  const oracles = Array(curvePools.length).fill(curveOracle.address);

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};

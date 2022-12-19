import { providers } from "ethers";

import { WombatLpTokenPriceOracle } from "../../../typechain/WombatLpTokenPriceOracle";
import { WombatDeployFnParams } from "../types";

export const deployWombatOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  wombatAssets,
}: WombatDeployFnParams): Promise<{ wombatOracle: WombatLpTokenPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  ///// Wombat Lp Token Price Oracle
  const wombat = await deployments.deploy("WombatLpTokenPriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (wombat.transactionHash) {
    await ethers.provider.waitForTransaction(wombat.transactionHash);
  }
  console.log("WombatLpTokenPriceOracle: ", wombat.address);

  const wombatOracle = (await ethers.getContractAt(
    "WombatLpTokenPriceOracle",
    wombat.address
  )) as WombatLpTokenPriceOracle;

  const underlyings = wombatAssets.map((w) => w.underlying);
  const oracles = Array(wombatAssets.length).fill(wombatOracle.address);

  const tx: providers.TransactionResponse = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  return { wombatOracle };
};

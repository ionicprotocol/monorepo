import { WombatLpTokenPriceOracle } from "../../../typechain/WombatLpTokenPriceOracle";
import { WombatDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

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
  await addUnderlyingsToMpo(mpo, underlyings, wombatOracle.address);
  return { wombatOracle };
};

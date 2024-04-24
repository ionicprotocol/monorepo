import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { RedStoneDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployRedStoneWeETHPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  redStoneAddress,
  redStoneAssets
}: RedStoneDeployFnParams): Promise<{ redStoneOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

  //// RedStone Oracle
  const redStone = await deployments.deploy("RedstoneAdapterPriceOracleWeETH", {
    from: deployer,
    args: [redStoneAddress],
    log: true,
    waitConfirmations: 1
  });

  if (redStone.transactionHash) await ethers.provider.waitForTransaction(redStone.transactionHash);
  console.log("RedstoneAdapterPriceOracleWeETH: ", redStone.address);

  const redStoneOracle = (await ethers.getContract("RedstoneAdapterPriceOracleWeETH", deployer)) as any;

  const underlyings = redStoneAssets.map((f) => f.underlying);
  const mpoAdmin = await mpo.callStatic.admin();
  if (false) {
    console.error(`failed to update mpo - use gnosis multisig? ${mpoAdmin} ${deployer}`);
  } else {
    await addUnderlyingsToMpo(mpo, underlyings, redStoneOracle.address);
  }
  return { redStoneOracle };
};

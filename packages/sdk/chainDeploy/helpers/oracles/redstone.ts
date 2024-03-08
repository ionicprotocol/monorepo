import { RedstoneAdapterPriceOracle } from "../../../typechain/RedstoneAdapterPriceOracle";
import { RedStoneDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployRedStonePriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  redStoneAddress,
  redStoneAssets
}: RedStoneDeployFnParams): Promise<{ redStoneOracle: RedstoneAdapterPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// RedStone Oracle
  const redStone = await deployments.deploy("RedStonePriceOracle", {
    from: deployer,
    args: [redStoneAddress],
    log: true,
    waitConfirmations: 1
  });

  if (redStone.transactionHash) await ethers.provider.waitForTransaction(redStone.transactionHash);
  console.log("RedStonePriceOracle: ", redStone.address);

  const redStoneOracle = (await ethers.getContract("RedStonePriceOracle", deployer)) as RedstoneAdapterPriceOracle;

  const underlyings = redStoneAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, redStoneOracle.address);
  return { redStoneOracle };
};

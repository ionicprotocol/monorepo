import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";

import { addUnderlyingsToMpoFallback } from "./utils";

export const addRedstoneFallbacks = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets
}): Promise<{ redStoneOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

  //// RedStone Oracle
  const redStone = await deployments.deploy("RedstoneAdapterPriceOracle", {
    from: deployer,
    args: ["0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256"],
    log: true,
    waitConfirmations: 1
  });

  if (redStone.transactionHash) await ethers.provider.waitForTransaction(redStone.transactionHash);
  console.log("RedstoneAdapterPriceOracle: ", redStone.address);

  const redStoneOracle = (await ethers.getContract("RedstoneAdapterPriceOracle", deployer)) as any;

  const underlyings = assets.map((f) => f.underlying);
  await addUnderlyingsToMpoFallback(mpo, underlyings, redStoneOracle.address);
  return { redStoneOracle };
};

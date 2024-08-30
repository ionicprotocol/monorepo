import { RedStoneDeployFnParams } from "../../types";
import { addUnderlyingsToMpo } from "./utils";

import { Address } from "viem";

export const deployRedStonePriceOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  redStoneAddress,
  redStoneAssets
}: RedStoneDeployFnParams): Promise<{ redStoneOracle: any }> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  //// RedStone Oracle
  const redStone = await deployments.deploy("RedstoneAdapterPriceOracleWeETH", {
    from: deployer,
    args: [redStoneAddress],
    log: true,
    waitConfirmations: 1
  });

  if (redStone.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: redStone.transactionHash as Address });
  console.log("RedstoneAdapterPriceOracleWeETH: ", redStone.address);

  const redStoneOracle = await viem.getContractAt(
    "RedstoneAdapterPriceOracleWeETH",
    (await deployments.get("RedstoneAdapterPriceOracleWeETH")).address as Address
  );

  const underlyings = redStoneAssets.map((f) => f.underlying);
  const mpoAdmin = await mpo.read.admin();
  if (mpoAdmin != deployer) {
    console.error(`failed to update mpo - use gnosis multisig? ${mpoAdmin} ${deployer}`);
  } else {
    await addUnderlyingsToMpo(mpo as any, underlyings, redStoneOracle.address, deployer, publicClient, walletClient);
  }
  return { redStoneOracle };
};

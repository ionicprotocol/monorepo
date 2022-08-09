import { providers } from "ethers";

import { aBNBcDeployParams } from "../types";

export const deployABNBcOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
}: aBNBcDeployParams): Promise<{ aBNBcOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const aBNBc = assets.find((a) => a.symbol === "aBNBc")!.underlying;
  const busd = assets.find((a) => a.symbol === "BUSD")!.underlying;

  const aBNBcOracle = await deployments.deploy("AnkrBNBcPriceOracle", {
    from: deployer,
    args: [
      "0xB1aD00B8BB49FB3534120b43f1FEACeAf584AE06", // https://www.ankr.com/docs/staking/liquid-staking/oracles/api
      mpo.address,
      aBNBc,
      busd,
    ],
    log: true,
    waitConfirmations: 1,
  });
  if (aBNBcOracle.transactionHash) await ethers.provider.waitForTransaction(aBNBcOracle.transactionHash);
  console.log("aBNBcOracle: ", aBNBcOracle.address);

  const tx: providers.TransactionResponse = await mpo.add([aBNBc], [aBNBcOracle.address]);
  await tx.wait();
  return { aBNBcOracle };
};

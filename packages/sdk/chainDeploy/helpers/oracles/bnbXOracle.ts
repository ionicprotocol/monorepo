import { assetSymbols, underlying } from "@midas-capital/types";
import { providers } from "ethers";

import { BNBxOracleDeployParams } from "../types";

export const deployBNBxPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
}: BNBxOracleDeployParams): Promise<{ BNBxPriceOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const BNBx = underlying(assets, assetSymbols.BNBx);

  const BNBxPriceOracle = await deployments.deploy("BNBxPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (BNBxPriceOracle.transactionHash) await ethers.provider.waitForTransaction(BNBxPriceOracle.transactionHash);
  console.log("BNBxPriceOracle: ", BNBxPriceOracle.address);

  const tx: providers.TransactionResponse = await mpo.add([BNBx], [BNBxPriceOracle.address]);
  await tx.wait();
  return { BNBxPriceOracle };
};

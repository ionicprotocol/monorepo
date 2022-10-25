import { assetSymbols, underlying } from "@midas-capital/types";
import { providers } from "ethers";

import { stkBNBOracleDeployParams } from "../types";

export const deployStkBNBOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
}: stkBNBOracleDeployParams): Promise<{ stkBNBOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const stkBNB = underlying(assets, assetSymbols.stkBNB);

  const stkBNBOracle = await deployments.deploy("StkBNBPriceOracle", {
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
  if (stkBNBOracle.transactionHash) await ethers.provider.waitForTransaction(stkBNBOracle.transactionHash);
  console.log("stkBNBOracle: ", stkBNBOracle.address);

  console.log(`adding to the mpo`);
  const tx: providers.TransactionResponse = await mpo.add([stkBNB], [stkBNBOracle.address]);
  console.log(`waiting to add to the mpo`);
  await tx.wait();
  return { stkBNBOracle };
};

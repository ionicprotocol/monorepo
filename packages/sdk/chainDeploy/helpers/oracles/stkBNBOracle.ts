import { assetSymbols, underlying } from "@ionicprotocol/types";

import { stkBNBOracleDeployParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

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

  await addUnderlyingsToMpo(mpo, [stkBNB], stkBNBOracle.address);
  return { stkBNBOracle };
};

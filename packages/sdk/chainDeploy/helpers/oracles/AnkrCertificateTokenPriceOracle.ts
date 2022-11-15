import { providers } from "ethers";
import { assetSymbols, underlying } from "types/dist/cjs";

import { aBNBcDeployParams } from "../types";

export const deployAnkrCertificateTokenPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
}: aBNBcDeployParams): Promise<{ ankrCertificateTokenPriceOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const aBNBc = underlying(assets, assetSymbols.aBNBc);

  const ankrCertificateTokenPriceOracle = await deployments.deploy("AnkrCertificateTokenPriceOracle", {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [aBNBc],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer,
    },
    log: true,
    waitConfirmations: 1,
  });
  if (ankrCertificateTokenPriceOracle.transactionHash)
    await ethers.provider.waitForTransaction(ankrCertificateTokenPriceOracle.transactionHash);
  console.log("ankrCertificateTokenPriceOracle: ", ankrCertificateTokenPriceOracle.address);

  const tx: providers.TransactionResponse = await mpo.add([aBNBc], [ankrCertificateTokenPriceOracle.address]);
  await tx.wait();
  return { ankrCertificateTokenPriceOracle };
};

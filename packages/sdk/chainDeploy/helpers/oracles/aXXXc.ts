import { underlying } from "@ionicprotocol/types";

import { aXXXcDeployParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployAnkrCertificateTokenPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
  certificateAssetSymbol
}: aXXXcDeployParams): Promise<{ ankrCertificateTokenPriceOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const aXXXc = underlying(assets, certificateAssetSymbol);

  const ankrCertificateTokenPriceOracle = await deployments.deploy("AnkrCertificateTokenPriceOracle", {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [aXXXc]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer
    },
    log: true,
    waitConfirmations: 1
  });
  if (ankrCertificateTokenPriceOracle.transactionHash)
    await ethers.provider.waitForTransaction(ankrCertificateTokenPriceOracle.transactionHash);
  console.log("ankrCertificateTokenPriceOracle: ", ankrCertificateTokenPriceOracle.address);

  await addUnderlyingsToMpo(mpo, [aXXXc], ankrCertificateTokenPriceOracle.address);

  return { ankrCertificateTokenPriceOracle };
};

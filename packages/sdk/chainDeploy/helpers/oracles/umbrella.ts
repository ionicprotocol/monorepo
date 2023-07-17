import { providers } from "ethers";

import { UmbrellaPriceOracle } from "../../../typechain/UmbrellaPriceOracle";
import { UmbrellaDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployUmbrellaOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  umbrellaAssets,
  nativeUsdFeed,
  registryAddress
}: UmbrellaDeployFnParams): Promise<{ umbrellaOracle: UmbrellaPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// UmbrellaP Oracle
  const umbrella = await deployments.deploy("UmbrellaPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [nativeUsdFeed, registryAddress]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });

  if (umbrella.transactionHash) await ethers.provider.waitForTransaction(umbrella.transactionHash);
  console.log("UmbrellaPriceOracle: ", umbrella.address);

  const umbrellaOracle = (await ethers.getContract("UmbrellaPriceOracle", deployer)) as UmbrellaPriceOracle;
  const tx: providers.TransactionResponse = await umbrellaOracle.setPriceFeeds(
    umbrellaAssets.map((f) => f.underlying),
    umbrellaAssets.map((f) => f.feed)
  );
  console.log(`Set price feeds for UmbrellaPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for UmbrellaPriceOracle mined: ${tx.hash}`);

  const underlyings = umbrellaAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, umbrellaOracle.address);
  return { umbrellaOracle };
};

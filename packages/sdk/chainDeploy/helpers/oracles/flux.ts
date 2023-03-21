import { providers } from "ethers";

import { FluxPriceOracle } from "../../../typechain/FluxPriceOracle";
import { FluxDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployFluxOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  fluxAssets,
  nativeUsdFeed,
}: FluxDeployFnParams): Promise<{ fluxOracle: FluxPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Flux Oracle
  const flux = await deployments.deploy("FluxPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [nativeUsdFeed],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });

  if (flux.transactionHash) await ethers.provider.waitForTransaction(flux.transactionHash);
  console.log("FluxPriceOracle: ", flux.address);

  const fluxOracle = (await ethers.getContract("FluxPriceOracle", deployer)) as FluxPriceOracle;
  const tx: providers.TransactionResponse = await fluxOracle.setPriceFeeds(
    fluxAssets.map((f) => f.underlying),
    fluxAssets.map((f) => f.feed)
  );
  console.log(`Set price feeds for FluxPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for FluxPriceOracle mined: ${tx.hash}`);

  const underlyings = fluxAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, fluxOracle.address);
  return { fluxOracle };
};

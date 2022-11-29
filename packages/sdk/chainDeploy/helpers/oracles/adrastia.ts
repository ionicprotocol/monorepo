import { providers } from "ethers";

import { AdrastiaPriceOracle } from "../../../lib/contracts/typechain/AdrastiaPriceOracle";
import { AdrastiaDeployFnParams } from "../types";

export const deployAdrastiaOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  adrastiaAssets,
  nativeUsdFeed,
}: AdrastiaDeployFnParams): Promise<{ adrastiaPriceOracle: AdrastiaPriceOracle }> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Adrastia Oracle
  const adrastia = await deployments.deploy("AdrastiaPriceOracle", {
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

  if (adrastia.transactionHash) await ethers.provider.waitForTransaction(adrastia.transactionHash);
  console.log("AdrastiaPriceOracle: ", adrastia.address);

  const adrastiaPriceOracle = (await ethers.getContract("AdrastiaPriceOracle", deployer)) as AdrastiaPriceOracle;
  tx = await adrastiaPriceOracle.setPriceFeeds(
    adrastiaAssets.map((f) => f.underlying),
    adrastiaAssets.map((f) => f.feed)
  );
  console.log(`Set price feeds for AdrastiaPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for AdrastiaPriceOracle mined: ${tx.hash}`);

  const underlyings = adrastiaAssets.map((f) => f.underlying);
  const oracles = Array(adrastiaAssets.length).fill(adrastiaPriceOracle.address);

  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  return { adrastiaPriceOracle };
};

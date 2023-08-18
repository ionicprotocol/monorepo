import { providers } from "ethers";

import { API3PriceOracle } from "../../../typechain/API3PriceOracle";
import { Api3DeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployAPI3PriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  usdToken,
  api3Assets,
  nativeTokenUsdFeed
}: Api3DeployFnParams): Promise<{ api3Oracle: API3PriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const api3 = await deployments.deploy("API3PriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [nativeTokenUsdFeed, usdToken]
        },
        onUpgrade: {
          methodName: "reinitialize",
          args: [usdToken, nativeTokenUsdFeed]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (api3.transactionHash) await ethers.provider.waitForTransaction(api3.transactionHash);
  console.log("API3PriceOracle: ", api3.address);

  const api3Oracle = (await ethers.getContract("API3PriceOracle", deployer)) as API3PriceOracle;
  const tx: providers.TransactionResponse = await api3Oracle.setPriceFeeds(
    api3Assets.map((f) => f.underlying),
    api3Assets.map((f) => f.feed)
  );
  console.log(`Set price feeds for API3PriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for API3PriceOracle mined: ${tx.hash}`);

  const underlyings = api3Assets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, api3Oracle.address);
  return { api3Oracle };
};

import { providers } from "ethers";

import { PythPriceOracle } from "../../../typechain/PythPriceOracle";
import { PythDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployPythPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  pythAddress,
  usdToken,
  pythAssets,
  nativeTokenUsdFeed
}: PythDeployFnParams): Promise<{ pythOracle: PythPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Pyth Oracle
  const pyth = await deployments.deploy("PythPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [pythAddress, nativeTokenUsdFeed, usdToken]
        },
        onUpgrade: {
          methodName: "reinitialize",
          args: [pythAddress, nativeTokenUsdFeed, usdToken]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (pyth.transactionHash) await ethers.provider.waitForTransaction(pyth.transactionHash);
  console.log("PythPriceOracle: ", pyth.address);

  const pythOracle = (await ethers.getContract("PythPriceOracle", deployer)) as PythPriceOracle;
  const tx: providers.TransactionResponse = await pythOracle.setPriceFeeds(
    pythAssets.map((f) => f.underlying),
    pythAssets.map((f) => f.feed)
  );
  console.log(`Set price feeds for PythPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for PythPriceOracle mined: ${tx.hash}`);

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, pythOracle.address);
  return { pythOracle };
};

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { PythPriceOracle } from "../../../typechain/PythPriceOracle";
import { addTransaction } from "../logging";
import { PythAsset, PythDeployFnParams } from "../types";

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

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

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

  const pythAssetsToChange: PythAsset[] = [];
  for (const pythAsset of pythAssets) {
    const currentPriceFeed = await pythOracle.priceFeedIds(pythAsset.underlying);
    if (currentPriceFeed !== pythAsset.feed) {
      pythAssetsToChange.push(pythAsset);
    }
  }
  if (pythAssetsToChange.length > 0) {
    if ((await pythOracle.owner()).toLowerCase() === deployer.toLowerCase()) {
      const tx = await pythOracle.setPriceFeeds(
        pythAssetsToChange.map((f) => f.underlying),
        pythAssetsToChange.map((f) => f.feed)
      );
      await tx.wait();
      console.log(`Set ${pythAssetsToChange.length} price feeds for PythPriceOracle at ${tx.hash}`);
    } else {
      const tx = await pythOracle.populateTransaction.setPriceFeeds(
        pythAssetsToChange.map((f) => f.underlying),
        pythAssetsToChange.map((f) => f.feed)
      );
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "bytes32[]", name: "feeds", type: "bytes32[]" }
          ],
          name: "setPriceFeeds",
          payable: false
        },
        contractInputsValues: {
          underlyings: pythAssetsToChange.map((f) => f.underlying),
          feeds: pythAssetsToChange.map((f) => f.feed)
        }
      });
      console.log(`Logged Transaction to set ${pythAssetsToChange.length} price feeds for PythPriceOracle `);
    }
  }

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, pythOracle.address, deployer);

  return { pythOracle };
};

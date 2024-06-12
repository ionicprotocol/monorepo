import { providers } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { PythPriceOracle } from "../../../typechain/PythPriceOracle";
import { PythDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";
import { addTransaction } from "../logging";

const multisig = "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2";
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
      owner: multisig,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (pyth.transactionHash) await ethers.provider.waitForTransaction(pyth.transactionHash);
  console.log("PythPriceOracle: ", pyth.address);

  const pythOracle = (await ethers.getContract("PythPriceOracle", deployer)) as PythPriceOracle;
  if (pythAssets.length > 0) {
    const tx = await pythOracle.populateTransaction.setPriceFeeds(
      pythAssets.map((f) => f.underlying),
      pythAssets.map((f) => f.feed)
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
        underlyings: pythAssets.map((f) => f.underlying),
        feeds: pythAssets.map((f) => f.feed)
      }
    });
  }

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, pythOracle.address);

  return { pythOracle };
};

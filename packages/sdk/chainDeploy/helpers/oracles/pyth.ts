import { providers } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { PythPriceOracle } from "../../../typechain/PythPriceOracle";
import { PythDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

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
    const tx: providers.TransactionResponse = await pythOracle.setPriceFeeds(
      pythAssets.map((f) => f.underlying),
      pythAssets.map((f) => f.feed)
    );
    console.log(`Set price feeds for PythPriceOracle: ${tx.hash}`);
    await tx.wait();
    console.log(`Set price feeds for PythPriceOracle mined: ${tx.hash}`);
  }

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, pythOracle.address);
  return { pythOracle };
};

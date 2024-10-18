import { Address, encodeFunctionData, GetContractReturnType, WalletClient } from "viem";

import { addTransaction, prepareAndLogTransaction } from "../logging";

import { addUnderlyingsToMpo } from "./utils";
import { PythAsset, PythDeployFnParams } from "../../types";
import { pythPriceOracleAbi } from "../../../../sdk/src/generated";

export const deployPythPriceOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  pythAddress,
  usdToken,
  pythAssets,
  nativeTokenUsdFeed
}: PythDeployFnParams): Promise<{ pythOracle: GetContractReturnType<typeof pythPriceOracleAbi, WalletClient> }> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

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
      owner: multisig ?? deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (pyth.transactionHash) publicClient.waitForTransactionReceipt({ hash: pyth.transactionHash as Address });
  console.log("PythPriceOracle: ", pyth.address);

  const pythOracle = await viem.getContractAt(
    "PythPriceOracle",
    (await deployments.get("PythPriceOracle")).address as Address
  );

  const pythAssetsToChange: PythAsset[] = [];
  console.log("🚀 ~ pythAssets:", pythAssets);
  for (const pythAsset of pythAssets) {
    const currentPriceFeed = await pythOracle.read.priceFeedIds([pythAsset.underlying]);
    console.log("🚀 ~ currentPriceFeed:", currentPriceFeed);
    if (currentPriceFeed !== pythAsset.feed) {
      pythAssetsToChange.push(pythAsset);
    }
  }
  console.log("🚀 ~ pythAssetsToChange:", pythAssetsToChange);
  if (pythAssetsToChange.length > 0) {
    if (((await pythOracle.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      const tx = await pythOracle.write.setPriceFeeds([
        pythAssetsToChange.map((f) => f.underlying),
        pythAssetsToChange.map((f) => f.feed)
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set ${pythAssetsToChange.length} price feeds for PythPriceOracle at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: pythOracle,
        args: [pythAssetsToChange.map((f) => f.underlying), pythAssetsToChange.map((f) => f.feed)],
        description: `Set ${pythAssetsToChange.length} price feeds for PythPriceOracle`,
        functionName: "setPriceFeeds",
        inputs: [
          { internalType: "address[]", name: "underlyings", type: "address[]" },
          { internalType: "bytes32[]", name: "feeds", type: "bytes32[]" }
        ]
      });
      console.log(`Logged Transaction to set ${pythAssetsToChange.length} price feeds for PythPriceOracle `);
    }
  }

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo as any, underlyings, pythOracle.address, deployer, publicClient);

  return { pythOracle: pythOracle as any };
};

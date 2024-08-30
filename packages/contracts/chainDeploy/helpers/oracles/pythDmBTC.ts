import { Address, GetContractReturnType, WalletClient } from "viem";

import { prepareAndLogTransaction } from "../logging";
import { pythPriceOracleAbi } from "../../../../sdk/src/generated";

import { addUnderlyingsToMpo } from "./utils";
import { PythAsset, PythDeployFnParams } from "../../types";

export const deployPythPriceOracleDmBTC = async ({
  viem,
  getNamedAccounts,
  deployments,
  pythAddress,
  usdToken,
  pythAssets,
  nativeTokenUsdFeed,
  dmBTC
}: PythDeployFnParams & { dmBTC: Address }): Promise<{
  pythOracle: GetContractReturnType<typeof pythPriceOracleAbi, WalletClient>;
}> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  //// Pyth Oracle
  const pyth = await deployments.deploy("PythPriceOracleDmBTC", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [pythAddress, nativeTokenUsdFeed, usdToken, dmBTC]
        },
        onUpgrade: {
          methodName: "reinitialize",
          args: [pythAddress, nativeTokenUsdFeed, usdToken, dmBTC]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (pyth.transactionHash) publicClient.waitForTransactionReceipt({ hash: pyth.transactionHash as Address });
  console.log("PythPriceOracleDmBTC: ", pyth.address);

  const pythOracle = await viem.getContractAt(
    "PythPriceOracleDmBTC",
    (await deployments.get("PythPriceOracleDmBTC")).address as Address
  );

  const pythAssetsToChange: PythAsset[] = [];
  for (const pythAsset of pythAssets) {
    const currentPriceFeed = await pythOracle.read.priceFeedIds([pythAsset.underlying]);
    if (currentPriceFeed !== pythAsset.feed) {
      pythAssetsToChange.push(pythAsset);
    }
  }
  if (pythAssetsToChange.length > 0) {
    if (((await pythOracle.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      const tx = await pythOracle.write.setPriceFeeds([
        pythAssetsToChange.map((f) => f.underlying),
        pythAssetsToChange.map((f) => f.feed)
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set ${pythAssetsToChange.length} price feeds for PythPriceOracleDmBTC at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: pythOracle,
        args: [pythAssetsToChange.map((f) => f.underlying), pythAssetsToChange.map((f) => f.feed)],
        description: `Set ${pythAssetsToChange.length} price feeds for PythPriceOracleDmBTC`,
        functionName: "setPriceFeeds",
        inputs: [
          { internalType: "address[]", name: "underlyings", type: "address[]" },
          { internalType: "bytes32[]", name: "feeds", type: "bytes32[]" }
        ]
      });
      console.log(`Logged Transaction to set ${pythAssetsToChange.length} price feeds for PythPriceOracleDmBTC `);
    }
  }

  const underlyings = pythAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo as any, underlyings, pythOracle.address, deployer, publicClient);

  return { pythOracle: pythOracle as any };
};

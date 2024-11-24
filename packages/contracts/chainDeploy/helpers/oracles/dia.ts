import { Address, GetContractReturnType, WalletClient } from "viem";

import { prepareAndLogTransaction } from "../logging";

import { addUnderlyingsToMpo } from "./utils";
import { DiaAsset, DiaDeployFnParams } from "../../types";
import { diaPriceOracleAbi } from "../../../../sdk/src/generated";
import { assetSymbols, underlying } from "@ionicprotocol/types";
import { base } from "@ionicprotocol/chains";

export const deployDiaPriceOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  diaAssets,
  diaNativeFeed
}: DiaDeployFnParams): Promise<{ diaOracle: GetContractReturnType<typeof diaPriceOracleAbi, WalletClient> }> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  //// Dia Oracle
  const dia = await deployments.deploy("DiaPriceOracle", {
    from: deployer,
    args: [
      deployer,
      true,
      "0x4200000000000000000000000000000000000006",
      diaNativeFeed?.feed ?? "0x0000000000000000000000000000000000000000",
      diaNativeFeed?.key ?? "",
      (await deployments.get("MasterPriceOracle")).address,
      underlying(base.assets, assetSymbols.USDC)
    ],
    log: true,
    waitConfirmations: 1
  });

  if (dia.transactionHash) publicClient.waitForTransactionReceipt({ hash: dia.transactionHash as Address });
  console.log("DiaPriceOracle: ", dia.address);

  const diaOracle = await viem.getContractAt(
    "DiaPriceOracle",
    (await deployments.get("DiaPriceOracle")).address as Address
  );

  const diaAssetsToChange: DiaAsset[] = [];
  console.log("🚀 ~ diaAssets:", diaAssets);
  for (const diaAsset of diaAssets) {
    const currentPriceFeed = await diaOracle.read.priceFeeds([diaAsset.underlying]);
    console.log("🚀 ~ currentPriceFeed:", currentPriceFeed);
    if (currentPriceFeed[0] !== diaAsset.feed || currentPriceFeed[1] !== diaAsset.key) {
      diaAssetsToChange.push(diaAsset);
    }
  }
  console.log("🚀 ~ diaAssetsToChange:", diaAssetsToChange);
  if (diaAssetsToChange.length > 0) {
    if (((await diaOracle.read.admin()) as Address).toLowerCase() === deployer.toLowerCase()) {
      const tx = await diaOracle.write.setPriceFeeds([
        diaAssetsToChange.map((f) => f.underlying),
        diaAssetsToChange.map((f) => f.feed),
        diaAssetsToChange.map((f) => f.key)
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set ${diaAssetsToChange.length} price feeds for DiaPriceOracle at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: diaOracle,
        args: [
          diaAssetsToChange.map((f) => f.underlying),
          diaAssetsToChange.map((f) => f.feed),
          diaAssetsToChange.map((f) => f.key)
        ],
        description: `Set ${diaAssetsToChange.length} price feeds for DiaPriceOracle`,
        functionName: "setPriceFeeds",
        inputs: [
          { internalType: "address[]", name: "underlyings", type: "address[]" },
          { internalType: "bytes32[]", name: "feeds", type: "bytes32[]" },
          { internalType: "string[]", name: "keys", type: "string[]" }
        ]
      });
      console.log(`Logged Transaction to set ${diaAssetsToChange.length} price feeds for DiaPriceOracle `);
    }
  }

  const underlyings = diaAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo as any, underlyings, diaOracle.address, deployer, publicClient);

  return { diaOracle: diaOracle as any };
};

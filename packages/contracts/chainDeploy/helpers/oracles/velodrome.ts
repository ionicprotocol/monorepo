import { prepareAndLogTransaction } from "../logging";
import { DeployResult } from "hardhat-deploy/types";
import { Address, Hex } from "viem";

import { addUnderlyingsToMpo } from "./utils";
import { underlying } from "../utils";
import { AerodromeDeployFnParams } from "../../types";

export const deployVelodromeOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  pricesContract,
  assets
}: AerodromeDeployFnParams): Promise<{ apo: DeployResult }> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  let tx: Hex;

  //// Velodrome Oracle
  const apo = await deployments.deploy("VelodromePriceOracle", {
    from: deployer,
    args: [pricesContract],
    log: true,
    waitConfirmations: 1
  });
  if (apo.transactionHash) await publicClient.waitForTransactionReceipt({ hash: apo.transactionHash as Address });
  console.log("VelodromePriceOracle: ", apo.address);

  const velodrome = await viem.getContractAt(
    "VelodromePriceOracle",
    (await deployments.get("VelodromePriceOracle")).address as Address
  );

  const underlyings = assets.map((c) => underlying(assets, c.symbol));

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  console.log("underlyings: ", underlyings);
  await addUnderlyingsToMpo(mpo as any, underlyings, velodrome.address, deployer, publicClient);

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );
  const velodromeAddress = await addressesProvider.read.getAddress(["VelodromePriceOracle"]);
  if (velodromeAddress !== velodrome.address) {
    if (((await addressesProvider.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await addressesProvider.write.setAddress(["VelodromePriceOracle", velodrome.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`setAddress VelodromePriceOracle at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: addressesProvider,
        functionName: "setAddress",
        args: ["VelodromePriceOracle", velodrome.address],
        description: "Set VelodromePriceOracle address on AddressProvider",
        inputs: [
          { internalType: "string", name: "id", type: "string" },
          { internalType: "address", name: "newAddress", type: "address" }
        ]
      });
      console.log("Logged Transaction to setAddress VelodromePriceOracle on AddressProvider");
    }
  }

  return { apo };
};

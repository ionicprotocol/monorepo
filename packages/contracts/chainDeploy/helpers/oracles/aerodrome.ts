import { prepareAndLogTransaction } from "../logging";
import { DeployResult } from "hardhat-deploy/types";
import { Address } from "viem";

import { addUnderlyingsToMpo } from "./utils";
import { underlying } from "../utils";
import { AerodromeDeployFnParams } from "../../types";

export const deployAerodromeOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  pricesContract,
  assets
}: AerodromeDeployFnParams): Promise<{ apo: DeployResult }> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);
  let tx;

  //// Aerodrome Oracle
  const apo = await deployments.deploy("AerodromePriceOracle", {
    from: deployer,
    args: [pricesContract],
    log: true,
    waitConfirmations: 1
  });
  if (apo.transactionHash) await publicClient.waitForTransactionReceipt({ hash: apo.transactionHash as Address });
  console.log("ChainlinkPriceOracleV2: ", apo.address);

  const aerodrome = await viem.getContractAt(
    "AerodromePriceOracle",
    (await deployments.get("AerodromePriceOracle")).address as Address
  );

  const underlyings = assets.map((c) => underlying(assets, c.symbol));

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  await addUnderlyingsToMpo(mpo as any, underlyings, aerodrome.address, deployer, publicClient, walletClient);

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );
  const aerodromeAddress = await addressesProvider.read.getAddress(["AerodromePriceOracle"]);
  if (aerodromeAddress !== aerodrome.address) {
    if (((await addressesProvider.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await addressesProvider.write.setAddress(["AerodromePriceOracle", aerodrome.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`setAddress AerodromePriceOracle at ${tx}`);
    } else {
      prepareAndLogTransaction({
        contractInstance: addressesProvider,
        functionName: "setAddress",
        args: ["AerodromePriceOracle", aerodrome.address],
        description: "Set AerodromePriceOracle address on AddressProvider",
        inputs: [
          { internalType: "string", name: "id", type: "string" },
          { internalType: "address", name: "newAddress", type: "address" }
        ]
      });
      console.log("Logged Transaction to setAddress ChainlinkPriceOracleV2 on AddressProvider");
    }
  }

  return { apo };
};

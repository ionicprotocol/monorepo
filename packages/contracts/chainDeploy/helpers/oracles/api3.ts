import { prepareAndLogTransaction } from "../logging";
import { DeployResult } from "hardhat-deploy/types";
import { Address } from "viem";

import { addUnderlyingsToMpo } from "./utils";
import { underlying } from "../utils";
import { AerodromeDeployFnParams, ChainlinkDeployFnParams } from "../../types";

export const deployApi3Oracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets
}: ChainlinkDeployFnParams): Promise<{ apo: DeployResult }> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  let tx;

  //// API3 Oracle
  const apo = await deployments.deploy("API3PriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.stableToken, deployConfig.nativeTokenUsdChainlinkFeed]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: multisig ?? deployer
    },
    waitConfirmations: 1,
    skipIfAlreadyDeployed: true
  });
  if (apo.transactionHash) await publicClient.waitForTransactionReceipt({ hash: apo.transactionHash as Address });

  const api3 = await viem.getContractAt(
    "API3PriceOracle",
    (await deployments.get("API3PriceOracle")).address as Address
  );

  const underlyings = assets.map((c) => underlying(assets, c.symbol));

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  console.log("underlyings: ", underlyings);
  await addUnderlyingsToMpo(mpo as any, underlyings, api3.address, deployer, publicClient);

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );
  const api3Address = await addressesProvider.read.getAddress(["API3PriceOracle"]);
  if (api3Address !== api3.address) {
    if (((await addressesProvider.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await addressesProvider.write.setAddress(["API3PriceOracle", api3.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`setAddress API3PriceOracle at ${tx}`);
    } else {
      prepareAndLogTransaction({
        contractInstance: addressesProvider,
        functionName: "setAddress",
        args: ["API3PriceOracle", api3.address],
        description: "Set API3PriceOracle address on AddressProvider",
        inputs: [
          { internalType: "string", name: "id", type: "string" },
          { internalType: "address", name: "newAddress", type: "address" }
        ]
      });
      console.log("Logged Transaction to setAddress API3PriceOracle on AddressProvider");
    }
  }

  return { apo };
};

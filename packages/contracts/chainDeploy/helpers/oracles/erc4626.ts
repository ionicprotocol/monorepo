import { Address } from "viem";
import { Erc4626OracleFnParams } from "../../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployErc4626PriceOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  erc4626Assets
}: Erc4626OracleFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  const e4626o = await deployments.deploy("ERC4626Oracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: []
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (e4626o.transactionHash) await publicClient.waitForTransactionReceipt({ hash: e4626o.transactionHash as Address });
  console.log("ERC4626Oracle: ", e4626o.address);

  const underlyings = erc4626Assets.map((f) => f.assetAddress);
  await addUnderlyingsToMpo(mpo as any, underlyings, e4626o.address as Address, deployer, publicClient);
};

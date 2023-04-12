import { Erc4626OracleFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployErc4626PriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  erc4626Assets,
}: Erc4626OracleFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const e4626o = await deployments.deploy("ERC4626Oracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (e4626o.transactionHash) await ethers.provider.waitForTransaction(e4626o.transactionHash);
  console.log("ERC4626Oracle: ", e4626o.address);

  const underlyings = erc4626Assets.map((f) => f.assetAddress);
  await addUnderlyingsToMpo(mpo, underlyings, e4626o.address);
};

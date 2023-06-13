import { assetSymbols, underlying } from "@midas-capital/types";

import { WstEthOracleFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployWstEthOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  assets,
}: WstEthOracleFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// WSTEthPriceOracle
  const wst = await deployments.deploy("WSTEthPriceOracle", {
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
  if (wst.transactionHash) await ethers.provider.waitForTransaction(wst.transactionHash);
  console.log("WSTEthPriceOracle: ", wst.address);

  const wstEthOracle = await ethers.getContract("WSTEthPriceOracle", deployer);

  const underlyings = [underlying(assets, assetSymbols.wstETH)];
  await addUnderlyingsToMpo(mpo, underlyings, wstEthOracle.address);
};

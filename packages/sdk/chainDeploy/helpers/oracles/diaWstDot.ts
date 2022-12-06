import { moonbeam } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { providers } from "ethers";

import { DiaStDotFnParams } from "../types";

export const deployDiaWstDotPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: DiaStDotFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const stDot = underlying(moonbeam.assets, assetSymbols.stDOT);
  const wstDot = underlying(moonbeam.assets, assetSymbols.wstDOT);
  const diaOracleAddress = "0xFEfe38321199e016c8d5e734A40eCCC0DBeC3711";

  const dspo = await deployments.deploy("DiaStDotPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [mpo.address, diaOracleAddress, deployConfig.stableToken],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  if (dspo.transactionHash) await ethers.provider.waitForTransaction(dspo.transactionHash);
  console.log("DiaStDotPriceOracle: ", dspo.address);

  const underlyings = [stDot, wstDot];
  const oracles = [dspo.address, dspo.address];

  const tx: providers.TransactionResponse = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};

import { constants, providers } from "ethers";

import { DiaPriceOracle } from "../../../typechain/DiaPriceOracle";
import { DiaDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployDiaOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  diaAssets,
  diaNativeFeed
}: DiaDeployFnParams): Promise<{ diaOracle: DiaPriceOracle }> => {
  const { deployer } = await getNamedAccounts();
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Dia Oracle
  const dia = await deployments.deploy("DiaPriceOracle", {
    from: deployer,
    args: [
      deployer,
      true,
      deployConfig.wtoken,
      diaNativeFeed.feed,
      diaNativeFeed.key,
      diaNativeFeed.feed === constants.AddressZero ? mpo.address : constants.AddressZero,
      diaNativeFeed.feed === constants.AddressZero ? deployConfig.stableToken : constants.AddressZero
    ],
    log: true
  });
  if (dia.transactionHash) await ethers.provider.waitForTransaction(dia.transactionHash);
  console.log("DiaPriceOracle: ", dia.address);

  const diaOracle = (await ethers.getContract("DiaPriceOracle", deployer)) as DiaPriceOracle;
  const tx: providers.TransactionResponse = await diaOracle.setPriceFeeds(
    diaAssets.map((d) => d.underlying),
    diaAssets.map((d) => d.feed),
    diaAssets.map((d) => d.key)
  );
  console.log(`Set price feeds for DiaPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for DiaPriceOracle mined: ${tx.hash}`);

  const underlyings = diaAssets.map((d) => d.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, diaOracle.address);

  return { diaOracle };
};

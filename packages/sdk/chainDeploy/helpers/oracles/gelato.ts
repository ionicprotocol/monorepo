import { providers } from "ethers";

import { GelatoGUniPriceOracle } from "../../typechain/GelatoGUniPriceOracle";
import { gelatoGUniPriceOracleDeployParams } from "../types";

export const deployGelatoGUniPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  gelatoAssets,
}: gelatoGUniPriceOracleDeployParams): Promise<{ gUniOracle: GelatoGUniPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Gelato GUni Price Oracle
  const gelatoGUniPriceOracle = await deployments.deploy("GelatoGUniPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
  });

  if (gelatoGUniPriceOracle.transactionHash)
    await ethers.provider.waitForTransaction(gelatoGUniPriceOracle.transactionHash);

  console.log("GelatoGUniPriceOracle: ", gelatoGUniPriceOracle.address);

  const gUniOracle = (await ethers.getContract("GelatoGUniPriceOracle", deployer)) as GelatoGUniPriceOracle;

  const underlyings = gelatoAssets.map((d) => d.vaultAddress);
  const oracles = Array(gelatoAssets.length).fill(gUniOracle.address);

  const tx: providers.TransactionResponse = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  return { gUniOracle };
};

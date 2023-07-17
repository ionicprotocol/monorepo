import { GelatoGUniPriceOracle } from "../../../typechain/GelatoGUniPriceOracle";
import { gelatoGUniPriceOracleDeployParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployGelatoGUniPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  gelatoAssets
}: gelatoGUniPriceOracleDeployParams): Promise<{ gUniOracle: GelatoGUniPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Gelato GUni Price Oracle
  const gelatoGUniPriceOracle = await deployments.deploy("GelatoGUniPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true
  });

  if (gelatoGUniPriceOracle.transactionHash)
    await ethers.provider.waitForTransaction(gelatoGUniPriceOracle.transactionHash);

  console.log("GelatoGUniPriceOracle: ", gelatoGUniPriceOracle.address);

  const gUniOracle = (await ethers.getContract("GelatoGUniPriceOracle", deployer)) as GelatoGUniPriceOracle;

  const underlyings = gelatoAssets.map((d) => d.vaultAddress);
  await addUnderlyingsToMpo(mpo, underlyings, gUniOracle.address);

  return { gUniOracle };
};

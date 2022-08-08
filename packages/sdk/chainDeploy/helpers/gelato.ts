import { providers } from "ethers";

import { DiaPriceOracle } from "../../lib/contracts/typechain/DiaPriceOracle.sol";

import { gelatoGUniPriceOracleDeployParams } from "./types";

export const deployGelatoGUniPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  gelatoAssets,
}: gelatoGUniPriceOracleDeployParams): Promise<{ diaOracle: DiaPriceOracle }> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// Gelato GUni Price Oracle
  const gelatoGUniPriceOracle = await deployments.deploy("GelatoGUniPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
  });
  if (gelatoGUniPriceOracle.transactionHash) await ethers.provider.waitForTransaction(dia.transactionHash);
  console.log("GelatoGUniPriceOracle: ", gelatoGUniPriceOracle.address);

  const diaOracle = (await ethers.getContract("DiaPriceOracle", deployer)) as DiaPriceOracle;
  tx = await diaOracle.setPriceFeeds(
    diaAssets.map((d) => d.underlying),
    diaAssets.map((d) => d.feed),
    diaAssets.map((d) => d.key)
  );
  console.log(`Set price feeds for DiaPriceOracle: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for DiaPriceOracle mined: ${tx.hash}`);

  const underlyings = diaAssets.map((d) => d.underlying);
  const oracles = Array(diaAssets.length).fill(diaOracle.address);

  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  return { diaOracle };
};

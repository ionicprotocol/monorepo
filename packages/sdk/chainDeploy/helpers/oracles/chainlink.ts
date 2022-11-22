import { SupportedAsset } from "@midas-capital/types";
import { providers } from "ethers";

import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { ChainlinkDeployFnParams, ChainlinkFeedBaseCurrency } from "../types";

export const deployChainlinkOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets,
  chainlinkAssets,
}: ChainlinkDeployFnParams): Promise<{ cpo: any; chainLinkv2: any }> => {
  const { deployer } = await getNamedAccounts();
  let tx: providers.TransactionResponse;

  //// Chainlink Oracle
  const cpo = await deployments.deploy("ChainlinkPriceOracleV2", {
    from: deployer,
    args: [deployer, true, deployConfig.wtoken, deployConfig.nativeTokenUsdChainlinkFeed],
    log: true,
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("ChainlinkPriceOracleV2: ", cpo.address);

  const chainLinkv2 = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
  tx = await chainLinkv2.setPriceFeeds(
    chainlinkAssets.map((c) => assets.find((a: SupportedAsset) => a.symbol === c.symbol)!.underlying),
    chainlinkAssets.map((c) => c.aggregator),
    ChainlinkFeedBaseCurrency.USD
  );
  console.log(`Set price feeds for ChainlinkPriceOracleV2: ${tx.hash}`);
  await tx.wait();
  console.log(`Set price feeds for ChainlinkPriceOracleV2 mined: ${tx.hash}`);

  const underlyings = chainlinkAssets.map((c) => assets.find((a) => a.symbol === c.symbol)!.underlying);
  const oracles = Array(chainlinkAssets.length).fill(chainLinkv2.address);

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  tx = await mpo.add(underlyings, oracles);
  await tx.wait();

  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const chainLinkv2Address = await addressesProvider.callStatic.getAddress("ChainlinkPriceOracleV2");
  if (chainLinkv2Address !== chainLinkv2.address) {
    tx = await addressesProvider.setAddress("ChainlinkPriceOracleV2", chainLinkv2.address);
    await tx.wait();
    console.log("setAddress ChainlinkPriceOracleV2: ", tx.hash);
  }

  return { cpo: cpo, chainLinkv2: chainLinkv2 };
};

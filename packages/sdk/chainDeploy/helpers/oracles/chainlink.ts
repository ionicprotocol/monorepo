import { underlying } from "@midas-capital/types";
import { providers } from "ethers";

import { AddressesProvider } from "@typechain/AddressesProvider";
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

  const usdBasedFeeds = chainlinkAssets.filter((asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.USD);
  const ethBasedFeeds = chainlinkAssets.filter((asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.ETH);

  const chainLinkv2 = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
  if (usdBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.USD;
    tx = await chainLinkv2.setPriceFeeds(
      usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
      usdBasedFeeds.map((c) => c.aggregator),
      feedCurrency
    );
    console.log(`Set ${feedCurrency} price feeds for ChainlinkPriceOracleV2: ${tx.hash}`);
    await tx.wait();
    console.log(`Set ${feedCurrency} price feeds for ChainlinkPriceOracleV2 mined: ${tx.hash}`);
  }
  if (ethBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.ETH;
    tx = await chainLinkv2.setPriceFeeds(
      usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
      usdBasedFeeds.map((c) => c.aggregator),
      feedCurrency
    );
    console.log(`Set ${feedCurrency} price feeds for ChainlinkPriceOracleV2: ${tx.hash}`);
    await tx.wait();
    console.log(`Set ${feedCurrency} price feeds for ChainlinkPriceOracleV2 mined: ${tx.hash}`);
  }

  const underlyings = chainlinkAssets.map((c) => underlying(assets, c.symbol));
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
